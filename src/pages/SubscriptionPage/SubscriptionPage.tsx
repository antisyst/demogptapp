import { useState, useRef, useEffect } from 'react';
import { Page } from '@/components/Page.tsx';
import { mainButton } from '@telegram-apps/sdk-react';
import { useSwipeable } from 'react-swipeable';
import { Card } from '@telegram-apps/telegram-ui';
import styles from './SubscriptionPage.module.scss';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic features for free users.',
    price: 0,
  },
  {
    id: 'base',
    name: 'Base',
    description: 'Access to chat history and more.',
    price: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Full features including search and attachments.',
    price: 10,
  },
];

export const SubscriptionPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const swipeHandlers = useSwipeable({
    onSwiped: (eventData) => {
      const { velocity, dir } = eventData;
      const bounceAmplitude = Math.min(40, velocity * 50);

      if (dir === 'Left') {
        if (currentIndex < plans.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setOffset(-bounceAmplitude); 
        }
      } else if (dir === 'Right') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        } else {
          setOffset(bounceAmplitude);
        }
      }
      setIsDragging(false);
    },
    onSwiping: () => setIsDragging(true),
    trackMouse: true,
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    swipeHandlers.ref(node);
  };

  useEffect(() => {
    if (offset !== 0) {
      const timer = setTimeout(() => setOffset(0), 100);
      return () => clearTimeout(timer);
    }
  }, [offset]);

  useEffect(() => {
    if (selectedPlan) {
      const selectedPlanDetails = plans.find((plan) => plan.id === selectedPlan);

      if (mainButton.mount.isAvailable() && !mainButton.isMounted()) {
        mainButton.mount();
      }

      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({
          text: `Subscribe to ${selectedPlanDetails?.name} ($${selectedPlanDetails?.price})`,
          isVisible: true,
          isEnabled: true,
        });
      }

      const offClick = mainButton.onClick(() => {
        console.log(`Subscribed to: ${selectedPlanDetails?.name}`);
      });

      return () => {
        offClick();
        mainButton.unmount();
      };
    } else {
      mainButton.unmount();
    }
  }, [selectedPlan]);

  return (
    <Page back={false}>
      <div className={styles.subscriptionPage}>
        <div className={styles.container} ref={combinedRef}>
          <div
            className={styles.carousel}
            style={{
              transform: `translateX(calc(-${currentIndex * 62}% - ${currentIndex * 16}px + ${offset}px))`,
              transition: isDragging ? 'none' : `transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)`,
            }}
          >
            {plans.map((plan) => (
              <Card key={plan.id} className={styles.card}>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <button
                  className={styles.chooseButton}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    console.log(`Plan chosen: ${plan.name}`);
                  }}
                >
                  Choose
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};