import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { HStack } from '@/components/HStack';
import { ticketService } from '@/services/tickets';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Alert, Vibration, View, StyleSheet, Platform, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function ScanTicketScreen() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [lastScannedTicket, setLastScannedTicket] = useState<string>("");

  // Check if we're running in a web browser
  const isWeb = Platform.OS === 'web';

  // Loading state
  if (!permission) {
    return (
      <VStack flex={1} justifyContent='center' alignItems='center' style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size={"large"} color={theme.primary} />
        <Text style={{ marginTop: 20, color: theme.text }}>Checking camera permissions...</Text>
      </VStack>
    );
  }

  // Permission not granted state
  if (!permission.granted) {
    return (
      <VStack gap={20} flex={1} justifyContent='center' alignItems='center' style={{ backgroundColor: theme.background, padding: 20 }}>
        <TabBarIcon name="camera" size={80} color={theme.primary} />
        <Text fontSize={24} bold style={{ textAlign: 'center', color: theme.text }}>Camera Access Required</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: theme.text }}>
          We need camera access to scan ticket QR codes. Your camera will only be used when you're on this screen.
        </Text>
        <Button onPress={requestPermission}>Allow Camera Access</Button>
      </VStack>
    );
  }

  // Function to handle barcode scanning
  async function onBarcodeScanned({ data }: BarcodeScanningResult) {
    if (!scanningEnabled) return;

    try {
      Vibration.vibrate();
      setScanningEnabled(false);
      setLastScannedTicket(data);

      const [ticket, owner] = data.split(",");
      const ticketId = parseInt(ticket.split(":")[1]);
      const ownerId = parseInt(owner.split(":")[1]);

      await ticketService.validateOne(ticketId, ownerId);

      Alert.alert('Success', "Ticket validated successfully.", [
        { text: 'Ok', onPress: () => {
          setScanningEnabled(true);
        }},
      ]);

    } catch (error) {
      Alert.alert('Error', "Failed to validate ticket. Please try again.");
      setScanningEnabled(true);
    }
  }

  // Web fallback UI
  if (isWeb) {
    return (
      <VStack flex={1} justifyContent='center' alignItems='center' style={{ backgroundColor: theme.background, padding: 20 }}>
        <View style={styles.webContainer}>
          <View style={styles.header}>
            <TabBarIcon name="scan" size={40} color={theme.primary} />
            <Text fontSize={24} bold style={{ color: theme.text, marginLeft: 10 }}>Ticket Scanner</Text>
          </View>
          
          <View style={[styles.mockScanner, { borderColor: theme.primary }]}>
            <View style={styles.scannerOverlay}>
              <View style={[styles.scannerCorner, styles.topLeft, { borderColor: theme.primary }]} />
              <View style={[styles.scannerCorner, styles.topRight, { borderColor: theme.primary }]} />
              <View style={[styles.scannerCorner, styles.bottomLeft, { borderColor: theme.primary }]} />
              <View style={[styles.scannerCorner, styles.bottomRight, { borderColor: theme.primary }]} />
              
              <View style={[styles.scanLine, { backgroundColor: theme.primary }]} />
            </View>
            <Text style={{ color: theme.text, textAlign: 'center', position: 'absolute', bottom: 20 }}>
              Scanning for QR codes...
            </Text>
          </View>
          
          <VStack gap={20} style={{ marginTop: 30, width: '100%' }}>
            <Text style={{ color: theme.text, textAlign: 'center' }}>
              Camera access is limited in web browsers. For the best experience, please use the mobile app.
            </Text>
            
            <Text style={{ color: theme.text, textAlign: 'center', fontWeight: 'bold' }}>
              To test ticket validation, you can use this demo button:
            </Text>
            
            <Button 
              onPress={() => {
                try {
                  const demoTicketData = "ticket:1,owner:2";
                  setLastScannedTicket(demoTicketData);
                  
                  // Simulate the validation process directly
                  Vibration.vibrate();
                  setScanningEnabled(false);
                  
                  // Parse the demo data
                  const [ticket, owner] = demoTicketData.split(",");
                  const ticketId = parseInt(ticket.split(":")[1]);
                  const ownerId = parseInt(owner.split(":")[1]);
                  
                  // Call the validation service
                  ticketService.validateOne(ticketId, ownerId)
                    .then(() => {
                      Alert.alert('Success', "Ticket validated successfully.", [
                        { text: 'Ok', onPress: () => setScanningEnabled(true) },
                      ]);
                    })
                    .catch(() => {
                      Alert.alert('Error', "Failed to validate ticket. Please try again.");
                      setScanningEnabled(true);
                    });
                } catch (error) {
                  Alert.alert('Error', "Failed to process demo ticket.");
                  setScanningEnabled(true);
                }
              }}
            >
              Validate Demo Ticket
            </Button>
            
            {lastScannedTicket && (
              <View style={styles.lastScanned}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>Last Scanned:</Text>
                <Text style={{ color: theme.text }}>{lastScannedTicket}</Text>
              </View>
            )}
          </VStack>
        </View>
      </VStack>
    );
  }

  // Camera view for mobile devices
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.scannerFrame}>
            <View style={[styles.scannerCorner, styles.topLeft, { borderColor: 'white' }]} />
            <View style={[styles.scannerCorner, styles.topRight, { borderColor: 'white' }]} />
            <View style={[styles.scannerCorner, styles.bottomLeft, { borderColor: 'white' }]} />
            <View style={[styles.scannerCorner, styles.bottomRight, { borderColor: 'white' }]} />
          </View>
          
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  mockScanner: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    width: '80%',
    aspectRatio: 1,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: '50%',
    opacity: 0.7,
  },
  lastScanned: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  }
});
