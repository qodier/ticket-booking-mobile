import React, { useState } from 'react'
import { Platform, TextInput, View, StyleSheet } from 'react-native'
import { Button } from './Button';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Text } from './Text';
import { HStack } from './HStack';
import { VStack } from './VStack';
import { useTheme } from '@/context/ThemeContext';

interface DateTimePickerProps {
  onChange: (date: Date) => void;  
  currentDate: Date;
}

export default function DateTimePicker(props: DateTimePickerProps) {
  if (Platform.OS === 'android') {
    return <AndroidDateTimePicker {...props} />;
  }

  if (Platform.OS === 'ios') {
    return <IOSDateTimePicker {...props} />;
  }

  // Web implementation
  return <WebDateTimePicker {...props} />;
}

export const AndroidDateTimePicker = ({ onChange, currentDate }: DateTimePickerProps) => {
  const { theme } = useTheme();
  
  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: currentDate,
      onChange: (_, date?: Date) => onChange(date || new Date()),
      mode: "date",
    });
  };
  
  const showTimepicker = () => {
    DateTimePickerAndroid.open({
      value: currentDate,
      onChange: (_, date?: Date) => onChange(date || new Date()),
      mode: "time",
      is24Hour: true,
    });
  };

  return (
    <VStack gap={5}>
      <HStack alignItems='center' justifyContent='space-between'>
        <Text>{ currentDate.toLocaleDateString() }</Text>
        <Button variant='outlined' onPress={showDatepicker}>Date</Button>
      </HStack>
      <HStack alignItems='center' justifyContent='space-between'>
        <Text>{ currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</Text>
        <Button variant='outlined' onPress={showTimepicker}>Time</Button>
      </HStack>
    </VStack>
  );
};

export const IOSDateTimePicker = ({ onChange, currentDate }: DateTimePickerProps) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'date' | 'time'>('date');
  
  return (
    <VStack gap={5}>
      <HStack alignItems='center' justifyContent='space-between'>
        <Text>{ currentDate.toLocaleDateString() }</Text>
        <Button variant='outlined' onPress={() => setMode('date')}>Date</Button>
      </HStack>
      <HStack alignItems='center' justifyContent='space-between'>
        <Text>{ currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</Text>
        <Button variant='outlined' onPress={() => setMode('time')}>Time</Button>
      </HStack>
      <RNDateTimePicker
        style={ { alignSelf: "flex-start", display: 'none' } }
        accentColor={theme.primary}
        minimumDate={ new Date() }
        value={ currentDate }
        mode={ mode }
        display='default'
        onChange={ (_, date) => onChange(date || new Date()) }
      />
    </VStack>
  )
}

export const WebDateTimePicker = ({ onChange, currentDate }: DateTimePickerProps) => {
  const { theme } = useTheme();
  
  // Format date as YYYY-MM-DD for input type="date"
  function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Initialize with the formatted date string
  const dateString = formatDateForInput(currentDate);
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newDateString = event.target.value;
    
    // Convert the string back to a Date object
    if (newDateString) {
      const newDate = new Date(newDateString);
      // Preserve the time from the current date
      newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
      onChange(newDate);
    }
  }
  
  // Format time as HH:MM for input type="time"
  function formatTimeForInput(date: Date): string {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  }
  
  // Initialize with the formatted time string
  const timeString = formatTimeForInput(currentDate);
  
  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newTimeString = event.target.value;
    
    if (newTimeString) {
      // Create a new date with the same date but updated time
      const [hours, minutes] = newTimeString.split(':').map(Number);
      const newDate = new Date(currentDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onChange(newDate);
    }
  }

  return (
    <View style={styles.webContainer}>
      <VStack gap={10}>
        <TextInput
          style={[
            styles.dateInput,
            {
              backgroundColor: theme.lightGray,
              color: theme.text,
              borderColor: theme.border
            }
          ]}
          value={dateString}
          onChange={handleChange as any}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="darkgray"
          // @ts-ignore - type="date" is valid in web but not recognized by React Native types
          type="date"
        />
        <TextInput
          style={[
            styles.dateInput,
            {
              backgroundColor: theme.lightGray,
              color: theme.text,
              borderColor: theme.border
            }
          ]}
          value={timeString}
          onChange={handleTimeChange as any}
          placeholder="HH:MM"
          placeholderTextColor="darkgray"
          // @ts-ignore - type="time" is valid in web but not recognized by React Native types
          type="time"
        />
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    padding: 10,
    width: '100%',
  },
  dateInput: {
    borderWidth: 0,
    borderRadius: 16,
    padding: 14,
    height: 48,
    width: '100%',
    fontSize: 16,
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
  }
});
