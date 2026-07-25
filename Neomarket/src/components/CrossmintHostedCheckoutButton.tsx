import type { ButtonHTMLAttributes, MouseEvent } from 'react';

type CrossmintEnvironment = 'development' | 'staging' | 'production';

type HostedCheckoutLineItem = {
  collectionLocator: string;
  callData?: Record<string, unknown>;
};

type HostedCheckoutPayment = {
  receiptEmail?: string;
  defaultMethod?: 'fiat' | 'crypto';
  fiat: {
    enabled: boolean;
    defaultCurrency?: string;
  };
  crypto: {
    enabled: boolean;
    defaultChain?: string;
    defaultCurrency?: string;
  };
};

type HostedCheckoutRecipient = {
  walletAddress?: string;
  email?: string;
};

type HostedCheckoutAppearance = {
  display?: 'popup' | 'new-tab' | 'same-tab';
  theme?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  overlay?: Record<string, unknown>;
  rules?: Record<string, unknown>;
};

type CrossmintHostedCheckoutButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  apiKey: string;
  lineItems: HostedCheckoutLineItem | HostedCheckoutLineItem[];
  payment: HostedCheckoutPayment;
  recipient?: HostedCheckoutRecipient;
  locale?: string;
  appearance?: HostedCheckoutAppearance;
  metadata?: Record<string, unknown>;
  fallbackLabel?: string;
};

const CROSSMINT_BASE_URLS: Record<CrossmintEnvironment, string> = {
  development: 'http://localhost:3000/',
  staging: 'https://staging.crossmint.com/',
  production: 'https://www.crossmint.com/',
};

function getEnvironmentFromApiKey(apiKey: string): CrossmintEnvironment {
  if (apiKey.startsWith('ck_development_')) return 'development';
  if (apiKey.startsWith('ck_staging_')) return 'staging';
  return 'production';
}

function appendHostedCheckoutParam(params: URLSearchParams, key: string, value: unknown) {
  if (!value || typeof value === 'function') return;

  if (typeof value === 'object') {
    params.append(
      key,
      JSON.stringify(value, (_nestedKey, nestedValue) =>
        typeof nestedValue === 'function' ? 'function' : nestedValue
      )
    );
    return;
  }

  if (typeof value === 'string') {
    if (value !== 'undefined') params.append(key, value);
    return;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    params.append(key, value.toString());
  }
}

function buildHostedCheckoutUrl({
  apiKey,
  lineItems,
  payment,
  recipient,
  locale,
  appearance,
  metadata,
}: Pick<
  CrossmintHostedCheckoutButtonProps,
  'apiKey' | 'lineItems' | 'payment' | 'recipient' | 'locale' | 'appearance' | 'metadata'
>) {
  const environment = getEnvironmentFromApiKey(apiKey);
  const baseUrl = CROSSMINT_BASE_URLS[environment];
  const params = new URLSearchParams();

  appendHostedCheckoutParam(params, 'lineItems', lineItems);
  appendHostedCheckoutParam(params, 'payment', payment);
  appendHostedCheckoutParam(params, 'recipient', recipient);
  appendHostedCheckoutParam(params, 'locale', locale);
  appendHostedCheckoutParam(params, 'appearance', appearance);
  appendHostedCheckoutParam(params, 'metadata', metadata);
  params.append('apiKey', apiKey);
  params.append('sdkMetadata', JSON.stringify({ name: 'neomarket', version: '0.0.0' }));

  return `${baseUrl}sdk/2024-03-05/hosted-checkout?${params.toString()}`;
}

export default function CrossmintHostedCheckoutButton({
  apiKey,
  lineItems,
  payment,
  recipient,
  locale,
  appearance,
  metadata,
  fallbackLabel = 'Pay with Crossmint',
  onClick,
  disabled,
  children,
  ...buttonProps
}: CrossmintHostedCheckoutButtonProps) {
  const isDisabled = disabled || !apiKey;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isDisabled) return;

    const checkoutUrl = buildHostedCheckoutUrl({
      apiKey,
      lineItems,
      payment,
      recipient,
      locale,
      appearance,
      metadata,
    });

    if (appearance?.display === 'same-tab') {
      window.location.href = checkoutUrl;
    } else {
      const target = appearance?.display === 'new-tab' ? '_blank' : 'crossmint_checkout';
      const features =
        appearance?.display === 'new-tab'
          ? 'noopener,noreferrer'
          : 'popup,width=450,height=750,noopener,noreferrer';
      const checkoutWindow = window.open(checkoutUrl, target, features);

      if (checkoutWindow == null) {
        window.location.href = checkoutUrl;
      }
    }

    onClick?.(event);
  }

  return (
    <button
      type="button"
      {...buttonProps}
      disabled={isDisabled}
      onClick={handleClick}
      title={!apiKey ? 'Crossmint checkout is missing its client API key.' : buttonProps.title}
    >
      {children ?? (apiKey ? fallbackLabel : 'Crossmint checkout unavailable')}
    </button>
  );
}
