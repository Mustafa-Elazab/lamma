import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ErrorInfo, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { AppErrorState } from '../design-system/molecules/ErrorState';
import { AppScreenTemplate } from '../design-system/templates/ScreenTemplate';
import { crashBreadcrumb, reportError } from '../services/crashReporting';

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <AppScreenTemplate
      scroll={false}
      contentStyle={styles.content}
      testID="global-error-fallback"
    >
      <AppErrorState
        title={t('errors.unexpectedTitle')}
        message={t('errors.unexpectedMessage')}
        retryLabel={t('common.retry')}
        onRetry={onReset}
      />
    </AppScreenTemplate>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
});

type Props = { children: ReactNode };
type State = { error: Error | null; resetKey: number };

export class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const componentStack = (info.componentStack ?? '').trim();
    crashBreadcrumb(`error boundary component stack:\n${componentStack}`);
    reportError(error, 'react.error-boundary', {
      fatal: false,
      componentStack,
      topComponent: componentStack.split('\n')[0]?.trim() ?? '',
    });
  }

  private reset = (): void => {
    this.setState(state => ({
      error: null,
      resetKey: state.resetKey + 1,
    }));
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return <ErrorFallback onReset={this.reset} />;
    }
    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
