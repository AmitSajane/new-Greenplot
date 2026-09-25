/**
 * Razorpay Standard Checkout, run inside a WebView.
 *
 * Deliberately NOT the native `react-native-razorpay` SDK — that needs its
 * own native module + pod install / gradle link. This app already ships
 * `react-native-webview` for other screens, so loading Razorpay's own
 * checkout.js inside one gets a fully-working payment sheet with zero new
 * native dependencies.
 */
import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../theme/tokens';
import { RazorpayOrder } from '../../services/paymentsApi';

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface Props {
  visible: boolean;
  order: RazorpayOrder | null;
  /** Shown on the checkout sheet as the merchant/business name. */
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (payload: RazorpaySuccess) => void;
  onDismiss: () => void;
  onError: (message: string) => void;
}

function buildCheckoutHtml(order: RazorpayOrder, name: string, description: string, prefill?: Props['prefill']) {
  // Kept as plain data (no functions) so JSON.stringify below can't be used
  // to smuggle anything but the values Razorpay's own SDK expects.
  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name,
    description,
    prefill: prefill ?? {},
    theme: { color: colors.primary },
  };
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#fff;">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  function post(payload) { window.ReactNativeWebView.postMessage(JSON.stringify(payload)); }
  var options = ${JSON.stringify(options)};
  options.handler = function (response) { post({ type: 'success', response: response }); };
  options.modal = { ondismiss: function () { post({ type: 'dismiss' }); } };
  var rzp = new Razorpay(options);
  rzp.on('payment.failed', function (resp) { post({ type: 'error', error: resp.error }); });
  rzp.open();
</script>
</body></html>`;
}

export function RazorpayCheckout({
  visible,
  order,
  name = 'GreenPlot',
  description = '',
  prefill,
  onSuccess,
  onDismiss,
  onError,
}: Props) {
  const html = useMemo(
    () => (order ? buildCheckoutHtml(order, name, description, prefill) : ''),
    [order, name, description, prefill],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'success') onSuccess(msg.response as RazorpaySuccess);
      else if (msg.type === 'dismiss') onDismiss();
      else if (msg.type === 'error') onError(msg.error?.description || 'Payment failed.');
    } catch {
      onError('Could not read the payment response.');
    }
  };

  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: { padding: spacing.xs },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
