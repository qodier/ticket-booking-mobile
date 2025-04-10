import { useCallback, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { HStack } from '@/components/HStack';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native';
import { globals } from '@/styles/_global';

export default function Login() {
  const { theme } = useTheme();
  const { authenticate, isLoadingAuth, error, clearError } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "register">('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Clear errors when switching auth modes
  useEffect(() => {
    clearError();
  }, [authMode, clearError]);

  // Show error alerts when they occur
  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error.message);
    }
  }, [error]);

  const isEmailValid = useMemo(() => {
    if (!email) return true; // Don't show error for empty field initially
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => {
    if (!password) return true; // Don't show error for empty field initially
    return password.length >= 6;
  }, [password]);

  const onAuthenticate = useCallback(async () => {
    Keyboard.dismiss();
    await authenticate(authMode, email, password);
  }, [authenticate, authMode, email, password]);

  const onToggleAuthMode = useCallback(() => {
    setAuthMode(prevMode => prevMode === 'login' ? 'register' : 'login');
    // Clear form when switching modes
    setEmail('');
    setPassword('');
  }, []);

  const emailErrorMessage = useMemo(() => {
    if (!email && error?.field === 'email') return error.message;
    if (email && !isEmailValid) return 'Please enter a valid email address';
    return '';
  }, [email, isEmailValid, error]);

  const passwordErrorMessage = useMemo(() => {
    if (!password && error?.field === 'password') return error.message;
    if (password && !isPasswordValid) return 'Password must be at least 6 characters';
    return '';
  }, [password, isPasswordValid, error]);

  const isFormValid = useMemo(() => {
    return email.trim() !== '' && 
           password.trim() !== '' && 
           isEmailValid && 
           isPasswordValid;
  }, [email, password, isEmailValid, isPasswordValid]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={globals.container}
      >
        <ScrollView 
          contentContainerStyle={globals.container}
          keyboardShouldPersistTaps="handled"
        >
          <VStack flex={1} justifyContent='center' alignItems='center' p={40} gap={40}>
            <HStack gap={10}>
              <Text fontSize={30} bold mb={20} accessibilityRole="header">
                Ticket Booking
              </Text>
              <TabBarIcon name="ticket" size={50} />
            </HStack>

            <VStack w={"100%"} gap={30}>
              <VStack gap={5}>
                <Text ml={10} fontSize={14} color="gray">Email</Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="darkgray"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  h={48}
                  p={14}
                  style={{
                    borderWidth: 1,
                    borderColor: emailErrorMessage
                      ? theme.error
                      : isEmailFocused
                        ? theme.primary
                        : 'transparent',
                    backgroundColor: theme.lightGray,
                    color: theme.text
                  }}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                />
                {emailErrorMessage ? (
                  <Text color={theme.error} fontSize={12} ml={10}>
                    {emailErrorMessage}
                  </Text>
                ) : null}
              </VStack>

              <VStack gap={5}>
                <Text ml={10} fontSize={14} color="gray">Password</Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor="darkgray"
                  autoCapitalize="none"
                  autoCorrect={false}
                  h={48}
                  p={14}
                  style={{
                    borderWidth: 1,
                    borderColor: passwordErrorMessage
                      ? theme.error
                      : isPasswordFocused
                        ? theme.primary
                        : 'transparent',
                    backgroundColor: theme.lightGray,
                    color: theme.text
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password, minimum 6 characters"
                />
                {passwordErrorMessage ? (
                  <Text color={theme.error} fontSize={12} ml={10}>
                    {passwordErrorMessage}
                  </Text>
                ) : null}
              </VStack>

              <Button 
                isLoading={isLoadingAuth} 
                onPress={onAuthenticate}
                disabled={!isFormValid || isLoadingAuth}
                accessibilityLabel={`${authMode} button`}
                accessibilityHint={`Press to ${authMode}`}
              >
                {authMode}
              </Button>
            </VStack>

            <Divider w={"90%"} />

            <Text 
              onPress={onToggleAuthMode} 
              fontSize={16} 
              underline
              accessibilityRole="button"
              accessibilityLabel="Toggle authentication mode"
              accessibilityHint={`Switch to ${authMode === 'login' ? 'register' : 'login'} mode`}
            >
              {authMode === 'login' ? 'Register new account' : 'Login to account'}
            </Text>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
