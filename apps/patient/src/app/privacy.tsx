import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { exportMyData, requestDeletion } from '@/lib/care';

function NotConfigured() {
  return (
    <View style={styles.center}>
      <Text style={styles.notice}>
        Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
      </Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const [exportData, setExportData] = useState<object | null>(null);
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [deletionError, setDeletionError] = useState('');
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  if (!isSupabaseConfigured) return <NotConfigured />;

  const handleExport = async () => {
    if (!supabase) return;
    setExporting(true);
    setExportError('');
    try {
      const session = await getSession();
      const userId = session?.user.id ?? '';
      const data = await exportMyData(supabase, userId);
      setExportData(data);
    } catch {
      setExportError('Failed to export data.');
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!supabase) return;
    setRequestingDeletion(true);
    setDeletionError('');
    try {
      const session = await getSession();
      const userId = session?.user.id ?? '';
      const orgId = (session?.user?.user_metadata?.org_id as string) ?? '';
      await requestDeletion(supabase, { patientId: userId, orgId });
      setDeletionRequested(true);
    } catch {
      setDeletionError('Failed to submit request.');
    } finally {
      setRequestingDeletion(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Privacy & Data</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Export my data</Text>
          <Text style={styles.body}>
            Download a copy of your assignments, adherence logs, and outcomes.
          </Text>
          <Pressable
            style={styles.btn}
            onPress={handleExport}
            disabled={exporting}
            testID="export-data-btn"
          >
            <Text style={styles.btnText}>{exporting ? 'Exporting...' : 'Export my data'}</Text>
          </Pressable>
          {exportError ? <Text style={styles.error}>{exportError}</Text> : null}
          {exportData ? (
            <Text style={styles.json} testID="export-result">
              {JSON.stringify(exportData, null, 2)}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Request data deletion</Text>
          <Text style={styles.body}>
            You may request deletion of your personal data. Note that clinical records
            may be retained by your clinic as required by applicable law and their data
            retention policy. Your request will be logged and forwarded to the clinic
            for action.
          </Text>
          {deletionRequested ? (
            <Text style={styles.notice} testID="deletion-requested-msg">
              Your deletion request has been submitted. The clinic will follow up per
              their policy.
            </Text>
          ) : (
            <Pressable
              style={[styles.btn, styles.btnDestructive]}
              onPress={handleRequestDeletion}
              disabled={requestingDeletion}
              testID="request-deletion-btn"
            >
              <Text style={styles.btnText}>
                {requestingDeletion ? 'Submitting...' : 'Request data deletion'}
              </Text>
            </Pressable>
          )}
          {deletionError ? <Text style={styles.error}>{deletionError}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  body: { fontSize: 14, color: '#555', marginBottom: 12, lineHeight: 20 },
  notice: { fontSize: 14, color: '#2F8F83', marginTop: 8 },
  section: { marginBottom: 32 },
  json: { fontSize: 11, fontFamily: 'monospace', color: '#333', marginTop: 12, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 },
  btn: { backgroundColor: '#2F8F83', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  btnDestructive: { backgroundColor: '#B42318' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: '#B42318', fontSize: 14, marginTop: 8 },
});
