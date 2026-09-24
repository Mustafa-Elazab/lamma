package com.lamma

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.AdvertisingOptions
import com.google.android.gms.nearby.connection.ConnectionInfo
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback
import com.google.android.gms.nearby.connection.ConnectionResolution
import com.google.android.gms.nearby.connection.ConnectionsClient
import com.google.android.gms.nearby.connection.ConnectionsStatusCodes
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo
import com.google.android.gms.nearby.connection.DiscoveryOptions
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback
import com.google.android.gms.nearby.connection.Payload
import com.google.android.gms.nearby.connection.PayloadCallback
import com.google.android.gms.nearby.connection.PayloadTransferUpdate
import com.google.android.gms.nearby.connection.Strategy
import java.nio.charset.StandardCharsets
import org.json.JSONArray
import org.json.JSONObject

class LammaGameSessionModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val connectionsClient: ConnectionsClient by lazy {
    Nearby.getConnectionsClient(reactContext)
  }
  private val connectedEndpoints = mutableSetOf<String>()
  private val endpointByCode = mutableMapOf<String, String>()
  private val sessionByCode = mutableMapOf<String, String>()
  private val playerActionsByCode = mutableMapOf<String, MutableList<String>>()
  private var hostedCode: String? = null
  private var lastHostedSessionJson: String? = null
  private var isDiscovering = false

  override fun getName() = "LammaGameSession"

  @ReactMethod
  fun host(sessionJson: String, promise: Promise) {
    try {
      val session = JSONObject(sessionJson)
      val code = normalizeCode(session.getString("code"))
      hostedCode = code
      lastHostedSessionJson = sessionJson
      playerActionsByCode[code] = mutableListOf()
      sessionByCode[code] = sessionJson
      connectionsClient.stopAdvertising()
      connectionsClient
        .startAdvertising(
          compactEndpointName(session),
          SERVICE_ID,
          connectionLifecycleCallback,
          AdvertisingOptions.Builder().setStrategy(STRATEGY).build(),
        )
        .addOnSuccessListener { promise.resolve(null) }
        .addOnFailureListener { error ->
          promise.reject("nearby_host_failed", error)
        }
    } catch (error: Exception) {
      promise.reject("nearby_host_invalid_session", error)
    }
  }

  @ReactMethod
  fun join(code: String, promise: Promise) {
    val normalizedCode = normalizeCode(code)
    val endpointId = endpointByCode[normalizedCode]
    val sessionJson = sessionByCode[normalizedCode]
    if (endpointId == null || sessionJson == null) {
      promise.resolve(null)
      return
    }
    connectionsClient
      .requestConnection(DEVICE_NAME, endpointId, connectionLifecycleCallback)
      .addOnSuccessListener { promise.resolve(sessionJson) }
      .addOnFailureListener { error ->
        promise.reject("nearby_join_failed", error)
      }
  }

  @ReactMethod
  fun listAvailableSessions(promise: Promise) {
    promise.resolve(jsonArray(sessionByCode.values))
  }

  @ReactMethod
  fun subscribeAvailableSessions(promise: Promise) {
    if (isDiscovering) {
      emitAvailableSessions()
      promise.resolve(null)
      return
    }
    connectionsClient
      .startDiscovery(
        SERVICE_ID,
        endpointDiscoveryCallback,
        DiscoveryOptions.Builder().setStrategy(STRATEGY).build(),
      )
      .addOnSuccessListener {
        isDiscovering = true
        emitAvailableSessions()
        promise.resolve(null)
      }
      .addOnFailureListener { error ->
        promise.reject("nearby_discovery_failed", error)
      }
  }

  @ReactMethod
  fun unsubscribeAvailableSessions(promise: Promise) {
    if (isDiscovering) {
      connectionsClient.stopDiscovery()
      isDiscovering = false
    }
    promise.resolve(null)
  }

  @ReactMethod
  fun publish(sessionJson: String, promise: Promise) {
    try {
      val session = JSONObject(sessionJson)
      val code = normalizeCode(session.getString("code"))
      sessionByCode[code] = sessionJson
      if (hostedCode == code) {
        lastHostedSessionJson = sessionJson
      }
      sendEnvelopeToConnectedEndpoints(
        JSONObject()
          .put("type", "session")
          .put("code", code)
          .put("session", sessionJson),
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("nearby_publish_failed", error)
    }
  }

  @ReactMethod
  fun subscribeSession(code: String, promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun unsubscribeSession(code: String, promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun submitPlayerAction(code: String, actionJson: String, promise: Promise) {
    val normalizedCode = normalizeCode(code)
    if (hostedCode == normalizedCode) {
      val actions = playerActionsByCode.getOrPut(normalizedCode) { mutableListOf() }
      actions.add(actionJson)
      emitPlayerActions(normalizedCode)
      promise.resolve(null)
      return
    }
    sendEnvelopeToConnectedEndpoints(
      JSONObject()
        .put("type", "playerAction")
        .put("code", normalizedCode)
        .put("action", actionJson),
    )
    promise.resolve(null)
  }

  @ReactMethod
  fun subscribePlayerActions(code: String, promise: Promise) {
    emitPlayerActions(normalizeCode(code))
    promise.resolve(null)
  }

  @ReactMethod
  fun unsubscribePlayerActions(code: String, promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun leave(sessionId: String, promise: Promise) {
    connectionsClient.stopAdvertising()
    connectionsClient.stopDiscovery()
    connectedEndpoints.clear()
    endpointByCode.clear()
    sessionByCode.clear()
    playerActionsByCode.clear()
    hostedCode = null
    lastHostedSessionJson = null
    isDiscovering = false
    promise.resolve(null)
  }

  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Int) = Unit

  private val endpointDiscoveryCallback =
    object : EndpointDiscoveryCallback() {
      override fun onEndpointFound(
        endpointId: String,
        info: DiscoveredEndpointInfo,
      ) {
        val sessionJson = sessionFromEndpointName(info.endpointName) ?: return
        val code = normalizeCode(JSONObject(sessionJson).getString("code"))
        endpointByCode[code] = endpointId
        sessionByCode[code] = sessionJson
        emitAvailableSessions()
      }

      override fun onEndpointLost(endpointId: String) {
        val code =
          endpointByCode.entries.firstOrNull { it.value == endpointId }?.key ?: return
        endpointByCode.remove(code)
        sessionByCode.remove(code)
        emitAvailableSessions()
      }
    }

  private val connectionLifecycleCallback =
    object : ConnectionLifecycleCallback() {
      override fun onConnectionInitiated(endpointId: String, info: ConnectionInfo) {
        connectionsClient.acceptConnection(endpointId, payloadCallback)
      }

      override fun onConnectionResult(endpointId: String, resolution: ConnectionResolution) {
        if (resolution.status.statusCode != ConnectionsStatusCodes.STATUS_OK) {
          return
        }
        connectedEndpoints.add(endpointId)
        val sessionJson = lastHostedSessionJson ?: return
        val code = hostedCode ?: return
        sendEnvelope(
          endpointId,
          JSONObject()
            .put("type", "session")
            .put("code", code)
            .put("session", sessionJson),
        )
      }

      override fun onDisconnected(endpointId: String) {
        connectedEndpoints.remove(endpointId)
      }
    }

  private val payloadCallback =
    object : PayloadCallback() {
      override fun onPayloadReceived(endpointId: String, payload: Payload) {
        val bytes = payload.asBytes() ?: return
        val envelope =
          JSONObject(String(bytes, StandardCharsets.UTF_8))
        val code = normalizeCode(envelope.optString("code"))
        when (envelope.optString("type")) {
          "session" -> {
            val sessionJson = envelope.getString("session")
            sessionByCode[code] = sessionJson
            emitSession(code, sessionJson)
          }
          "playerAction" -> {
            val actionJson = envelope.getString("action")
            val actions = playerActionsByCode.getOrPut(code) { mutableListOf() }
            actions.add(actionJson)
            emitPlayerActions(code)
          }
        }
      }

      override fun onPayloadTransferUpdate(
        endpointId: String,
        update: PayloadTransferUpdate,
      ) = Unit
    }

  private fun sendEnvelopeToConnectedEndpoints(envelope: JSONObject) {
    connectedEndpoints.forEach { endpointId -> sendEnvelope(endpointId, envelope) }
  }

  private fun sendEnvelope(endpointId: String, envelope: JSONObject) {
    connectionsClient.sendPayload(
      endpointId,
      Payload.fromBytes(envelope.toString().toByteArray(StandardCharsets.UTF_8)),
    )
  }

  private fun emitAvailableSessions() {
    val payload = Arguments.createMap()
    payload.putArray("sessions", jsonArray(sessionByCode.values))
    emit("LammaGameSession.availableSessions", payload)
  }

  private fun emitSession(code: String, sessionJson: String) {
    val payload = Arguments.createMap()
    payload.putString("code", code)
    payload.putString("session", sessionJson)
    emit("LammaGameSession.session", payload)
  }

  private fun emitPlayerActions(code: String) {
    val payload = Arguments.createMap()
    payload.putString("code", code)
    payload.putArray("actions", jsonArray(playerActionsByCode[code] ?: emptyList()))
    emit("LammaGameSession.playerActions", payload)
  }

  private fun emit(eventName: String, payload: WritableMap) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, payload)
  }

  private fun compactEndpointName(session: JSONObject): String {
    val hostId = session.getString("hostId")
    val players = session.optJSONArray("players") ?: JSONArray()
    var hostName = "Host"
    for (index in 0 until players.length()) {
      val player = players.optJSONObject(index) ?: continue
      if (player.optString("id") == hostId) {
        hostName = player.optString("name", hostName)
      }
    }
    return JSONObject()
      .put("id", session.getString("id"))
      .put("gameId", session.getString("gameId"))
      .put("code", session.getString("code"))
      .put("hostId", hostId)
      .put("hostName", hostName)
      .put("createdAt", session.optLong("createdAt", System.currentTimeMillis()))
      .put("updatedAt", session.optLong("updatedAt", System.currentTimeMillis()))
      .toString()
  }

  private fun sessionFromEndpointName(endpointName: String): String? =
    try {
      val info = JSONObject(endpointName)
      val now = System.currentTimeMillis()
      JSONObject()
        .put("id", info.getString("id"))
        .put("gameId", info.getString("gameId"))
        .put("code", info.getString("code"))
        .put("phase", "lobby")
        .put("hostId", info.getString("hostId"))
        .put(
          "players",
          JSONArray()
            .put(
              JSONObject()
                .put("id", info.getString("hostId"))
                .put("name", info.optString("hostName", "Host"))
                .put("isHost", true)
                .put("connected", true),
            ),
        )
        .put("createdAt", info.optLong("createdAt", now))
        .put("updatedAt", info.optLong("updatedAt", now))
        .toString()
    } catch (_: Exception) {
      null
    }

  private fun jsonArray(values: Collection<String>): WritableArray {
    val array = Arguments.createArray()
    values.forEach { value -> array.pushString(value) }
    return array
  }

  private fun normalizeCode(code: String): String = code.trim().uppercase()

  companion object {
    private const val SERVICE_ID = "com.lamma.games.session"
    private const val DEVICE_NAME = "Lamma"
    private val STRATEGY = Strategy.P2P_CLUSTER
  }
}
