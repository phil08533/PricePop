import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildAffiliateUrl, AFFILIATE_DISCLOSURE } from '@services/affiliateService';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@constants/index';

/**
 * In-app product browser.
 * Uses WebView so the user stays in the app — critical for affiliate attribution.
 * The affiliate tag is always injected via buildAffiliateUrl.
 */
export default function ProductRevealScreen() {
  const insets = useSafeAreaInsets();
  const { asin, productName } = useLocalSearchParams<{
    asin: string;
    productName: string;
  }>();

  const [loading, setLoading] = useState(true);
  const url = buildAffiliateUrl(asin ?? '');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {productName ?? 'Amazon Product'}
          </Text>
          <Text style={styles.disclosure} numberOfLines={1}>
            {AFFILIATE_DISCLOSURE}
          </Text>
        </View>
      </View>

      {/* Amazon watermark */}
      <View style={styles.amazonBanner}>
        <Text style={styles.amazonText}>amazon</Text>
        <Text style={styles.amazonBadge}>Associate</Text>
      </View>

      {/* WebView */}
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.webLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        // Prevent navigation away from Amazon
        onNavigationStateChange={(navState) => {
          if (!navState.url.includes('amazon.com')) {
            // User clicked an external link — allow but track
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.md, fontWeight: '700' },
  titleArea: { flex: 1 },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  disclosure: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  amazonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    gap: SPACING.sm,
  },
  amazonText: { fontSize: FONT_SIZES.md, fontWeight: '900', color: '#000', fontStyle: 'italic' },
  amazonBadge: {
    fontSize: FONT_SIZES.xs,
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    fontWeight: '600',
    overflow: 'hidden',
  },
  webview: { flex: 1 },
  webLoading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDark,
  },
});
