import { useSignal, initData } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Page } from '@/components/Page.tsx';
import { Spinner, Placeholder } from '@telegram-apps/telegram-ui';
import styles from './LoadingPage.module.scss';

export const LoadingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [defaultPlan, setDefaultPlan] = useState<string>('free');
  const [error, setError] = useState<string | null>(null);

  const initDataState = useSignal(initData.state);

  useEffect(() => {
    const sendUserDataToBackend = async () => {
      try {
        if (!initDataState || !initDataState.user) {
          throw new Error('Init data or user information is missing.');
        }

        const user = initDataState.user;

        const response = await fetch('/api/backend/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            language_code: user.languageCode,
            is_premium: user.isPremium,
            allows_write_to_pm: user.allowsWriteToPm,
            auth_date: initDataState.authDate,
            chat_instance: initDataState.chatInstance,
            chat_type: initDataState.chatType,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send user data to the backend.');
        }

        const result = await response.json();

        if (result.user_registered) {
          setRedirectTo(`/working-fields?plan=${result.user_subscription_plan}`);
        } else {
          setDefaultPlan(result.user_subscription_plan || 'free');
          console.log(defaultPlan);
          setRedirectTo('/subscription');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    sendUserDataToBackend();
  }, [initDataState]);

  if (isLoading) {
    return (
      <Page>
        <div className={styles.loadingOverlay}>
          <Spinner size="l" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Placeholder
          header="Error"
          description={error}
        >
          <img
            alt="Error sticker"
            src="https://xelene.me/telegram-error.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
      </Page>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return null; 
};
