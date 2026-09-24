import Foundation
import MultipeerConnectivity
import React

@objc(LammaGameSession)
class LammaGameSession: RCTEventEmitter {
  private let serviceType = "lamma-games"
  private let peerID = MCPeerID(displayName: UIDevice.current.name)
  private lazy var session = MCSession(
    peer: peerID,
    securityIdentity: nil,
    encryptionPreference: .required
  )
  private var advertiser: MCNearbyServiceAdvertiser?
  private var browser: MCNearbyServiceBrowser?
  private var sessionByCode: [String: String] = [:]
  private var endpointByCode: [String: MCPeerID] = [:]
  private var playerActionsByCode: [String: [String]] = [:]
  private var hostedCode: String?
  private var lastHostedSessionJson: String?

  override init() {
    super.init()
    session.delegate = self
  }

  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  override func supportedEvents() -> [String]! {
    [
      "LammaGameSession.session",
      "LammaGameSession.availableSessions",
      "LammaGameSession.playerActions",
    ]
  }

  @objc(host:resolver:rejecter:)
  func host(
    _ sessionJson: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard
      let sessionInfo = dictionary(from: sessionJson),
      let code = sessionInfo["code"] as? String
    else {
      reject("multipeer_host_invalid_session", "Invalid game session.", nil)
      return
    }
    let normalizedCode = normalizeCode(code)
    hostedCode = normalizedCode
    lastHostedSessionJson = sessionJson
    sessionByCode[normalizedCode] = sessionJson
    playerActionsByCode[normalizedCode] = []
    advertiser?.stopAdvertisingPeer()
    advertiser = MCNearbyServiceAdvertiser(
      peer: peerID,
      discoveryInfo: discoveryInfo(from: sessionInfo),
      serviceType: serviceType
    )
    advertiser?.delegate = self
    advertiser?.startAdvertisingPeer()
    resolve(nil)
  }

  @objc(join:resolver:rejecter:)
  func join(
    _ code: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let normalizedCode = normalizeCode(code)
    guard let peer = endpointByCode[normalizedCode] else {
      resolve(nil)
      return
    }
    browser?.invitePeer(peer, to: session, withContext: nil, timeout: 10)
    resolve(sessionByCode[normalizedCode])
  }

  @objc(listAvailableSessions:rejecter:)
  func listAvailableSessions(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(Array(sessionByCode.values))
  }

  @objc(subscribeAvailableSessions:rejecter:)
  func subscribeAvailableSessions(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if browser == nil {
      browser = MCNearbyServiceBrowser(peer: peerID, serviceType: serviceType)
      browser?.delegate = self
      browser?.startBrowsingForPeers()
    }
    emitAvailableSessions()
    resolve(nil)
  }

  @objc(unsubscribeAvailableSessions:rejecter:)
  func unsubscribeAvailableSessions(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    browser?.stopBrowsingForPeers()
    browser = nil
    resolve(nil)
  }

  @objc(publish:resolver:rejecter:)
  func publish(
    _ sessionJson: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard
      let sessionInfo = dictionary(from: sessionJson),
      let code = sessionInfo["code"] as? String
    else {
      reject("multipeer_publish_failed", "Invalid game session.", nil)
      return
    }
    let normalizedCode = normalizeCode(code)
    sessionByCode[normalizedCode] = sessionJson
    if hostedCode == normalizedCode {
      lastHostedSessionJson = sessionJson
    }
    sendEnvelope(["type": "session", "code": normalizedCode, "session": sessionJson])
    resolve(nil)
  }

  @objc(subscribeSession:resolver:rejecter:)
  func subscribeSession(
    _ code: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(nil)
  }

  @objc(unsubscribeSession:resolver:rejecter:)
  func unsubscribeSession(
    _ code: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(nil)
  }

  @objc(submitPlayerAction:actionJson:resolver:rejecter:)
  func submitPlayerAction(
    _ code: String,
    actionJson: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let normalizedCode = normalizeCode(code)
    if hostedCode == normalizedCode {
      playerActionsByCode[normalizedCode, default: []].append(actionJson)
      emitPlayerActions(code: normalizedCode)
      resolve(nil)
      return
    }
    sendEnvelope([
      "type": "playerAction",
      "code": normalizedCode,
      "action": actionJson,
    ])
    resolve(nil)
  }

  @objc(subscribePlayerActions:resolver:rejecter:)
  func subscribePlayerActions(
    _ code: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    emitPlayerActions(code: normalizeCode(code))
    resolve(nil)
  }

  @objc(unsubscribePlayerActions:resolver:rejecter:)
  func unsubscribePlayerActions(
    _ code: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(nil)
  }

  @objc(leave:resolver:rejecter:)
  func leave(
    _ sessionId: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    advertiser?.stopAdvertisingPeer()
    browser?.stopBrowsingForPeers()
    advertiser = nil
    browser = nil
    session.disconnect()
    sessionByCode.removeAll()
    endpointByCode.removeAll()
    playerActionsByCode.removeAll()
    hostedCode = nil
    lastHostedSessionJson = nil
    resolve(nil)
  }

  private func discoveryInfo(from sessionInfo: [String: Any]) -> [String: String] {
    let hostId = sessionInfo["hostId"] as? String ?? "host"
    let hostName = hostName(from: sessionInfo, hostId: hostId)
    return [
      "id": sessionInfo["id"] as? String ?? UUID().uuidString,
      "gameId": sessionInfo["gameId"] as? String ?? "icebreakers",
      "code": sessionInfo["code"] as? String ?? "",
      "hostId": hostId,
      "hostName": hostName,
      "createdAt": stringTime(sessionInfo["createdAt"]),
      "updatedAt": stringTime(sessionInfo["updatedAt"]),
    ]
  }

  private func sessionJson(from discoveryInfo: [String: String]) -> String? {
    guard
      let id = discoveryInfo["id"],
      let gameId = discoveryInfo["gameId"],
      let code = discoveryInfo["code"],
      let hostId = discoveryInfo["hostId"]
    else {
      return nil
    }
    let now = Int(Date().timeIntervalSince1970 * 1000)
    let payload: [String: Any] = [
      "id": id,
      "gameId": gameId,
      "code": code,
      "phase": "lobby",
      "hostId": hostId,
      "players": [[
        "id": hostId,
        "name": discoveryInfo["hostName"] ?? "Host",
        "isHost": true,
        "connected": true,
      ]],
      "createdAt": Int(discoveryInfo["createdAt"] ?? "") ?? now,
      "updatedAt": Int(discoveryInfo["updatedAt"] ?? "") ?? now,
    ]
    return jsonString(from: payload)
  }

  private func hostName(from sessionInfo: [String: Any], hostId: String) -> String {
    guard let players = sessionInfo["players"] as? [[String: Any]] else {
      return "Host"
    }
    return players.first { $0["id"] as? String == hostId }?["name"] as? String ?? "Host"
  }

  private func stringTime(_ value: Any?) -> String {
    if let number = value as? NSNumber {
      return number.stringValue
    }
    if let int = value as? Int {
      return "\(int)"
    }
    return "\(Int(Date().timeIntervalSince1970 * 1000))"
  }

  private func sendEnvelope(_ envelope: [String: Any]) {
    guard !session.connectedPeers.isEmpty, let data = jsonData(from: envelope) else {
      return
    }
    try? session.send(data, toPeers: session.connectedPeers, with: .reliable)
  }

  private func emitAvailableSessions() {
    sendEvent(
      withName: "LammaGameSession.availableSessions",
      body: ["sessions": Array(sessionByCode.values)]
    )
  }

  private func emitSession(code: String, sessionJson: String) {
    sendEvent(
      withName: "LammaGameSession.session",
      body: ["code": code, "session": sessionJson]
    )
  }

  private func emitPlayerActions(code: String) {
    sendEvent(
      withName: "LammaGameSession.playerActions",
      body: ["code": code, "actions": playerActionsByCode[code] ?? []]
    )
  }

  private func dictionary(from json: String) -> [String: Any]? {
    guard let data = json.data(using: .utf8) else {
      return nil
    }
    return try? JSONSerialization.jsonObject(with: data) as? [String: Any]
  }

  private func jsonData(from value: [String: Any]) -> Data? {
    try? JSONSerialization.data(withJSONObject: value)
  }

  private func jsonString(from value: [String: Any]) -> String? {
    guard let data = jsonData(from: value) else {
      return nil
    }
    return String(data: data, encoding: .utf8)
  }

  private func normalizeCode(_ code: String) -> String {
    code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
  }
}

extension LammaGameSession: MCNearbyServiceAdvertiserDelegate {
  func advertiser(
    _ advertiser: MCNearbyServiceAdvertiser,
    didReceiveInvitationFromPeer peerID: MCPeerID,
    withContext context: Data?,
    invitationHandler: @escaping (Bool, MCSession?) -> Void
  ) {
    invitationHandler(true, session)
  }
}

extension LammaGameSession: MCNearbyServiceBrowserDelegate {
  func browser(
    _ browser: MCNearbyServiceBrowser,
    foundPeer peerID: MCPeerID,
    withDiscoveryInfo info: [String: String]?
  ) {
    guard let info, let code = info["code"], let sessionJson = sessionJson(from: info) else {
      return
    }
    let normalizedCode = normalizeCode(code)
    endpointByCode[normalizedCode] = peerID
    sessionByCode[normalizedCode] = sessionJson
    emitAvailableSessions()
  }

  func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
    guard let code = endpointByCode.first(where: { $0.value == peerID })?.key else {
      return
    }
    endpointByCode.removeValue(forKey: code)
    sessionByCode.removeValue(forKey: code)
    emitAvailableSessions()
  }
}

extension LammaGameSession: MCSessionDelegate {
  func session(
    _ session: MCSession,
    peer peerID: MCPeerID,
    didChange state: MCSessionState
  ) {
    guard state == .connected, let code = hostedCode, let sessionJson = lastHostedSessionJson else {
      return
    }
    sendEnvelope(["type": "session", "code": code, "session": sessionJson])
  }

  func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
    guard
      let envelope = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let type = envelope["type"] as? String,
      let code = envelope["code"] as? String
    else {
      return
    }
    let normalizedCode = normalizeCode(code)
    if type == "session", let sessionJson = envelope["session"] as? String {
      sessionByCode[normalizedCode] = sessionJson
      emitSession(code: normalizedCode, sessionJson: sessionJson)
    }
    if type == "playerAction", let actionJson = envelope["action"] as? String {
      playerActionsByCode[normalizedCode, default: []].append(actionJson)
      emitPlayerActions(code: normalizedCode)
    }
  }

  func session(
    _ session: MCSession,
    didReceive stream: InputStream,
    withName streamName: String,
    fromPeer peerID: MCPeerID
  ) {}

  func session(
    _ session: MCSession,
    didStartReceivingResourceWithName resourceName: String,
    fromPeer peerID: MCPeerID,
    with progress: Progress
  ) {}

  func session(
    _ session: MCSession,
    didFinishReceivingResourceWithName resourceName: String,
    fromPeer peerID: MCPeerID,
    at localURL: URL?,
    withError error: Error?
  ) {}
}
