import { Button } from '@/components/Button';
import DateTimePicker from '@/components/DateTimePicker';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { VStack } from '@/components/VStack';
import { eventService } from '@/services/events';
import { useNavigation, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function NewEvent() {
  const navigation = useNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)); // Default to 2 hours later

  async function onSubmit() {
    try {
      setIsSubmitting(true);

      await eventService.createOne(name, location, startDate.toISOString(), endDate.toISOString());
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onChangeStartDate(date?: Date) {
    const newStartDate = date || new Date();
    setStartDate(newStartDate);
    
    // If end date is before start date, update end date to be 2 hours after start date
    if (endDate < newStartDate) {
      setEndDate(new Date(newStartDate.getTime() + 2 * 60 * 60 * 1000));
    }
  }

  function onChangeEndDate(date?: Date) {
    const newEndDate = date || new Date();
    setEndDate(newEndDate);
  }

  useEffect(() => {
    navigation.setOptions({ headerTitle: "New Event" });
  }, [navigation]);

  return (
    <VStack m={ 20 } flex={ 1 } gap={ 30 }>

      <VStack gap={ 5 }>
        <Text ml={ 10 } fontSize={ 14 } color="gray">Name</Text>
        <Input
          value={ name }
          onChangeText={ setName }
          placeholder="Name"
          placeholderTextColor="darkgray"
          h={ 48 }
          p={ 14 }
        />
      </VStack>

      <VStack gap={ 5 }>
        <Text ml={ 10 } fontSize={ 14 } color="gray">Location</Text>
        <Input
          value={ location }
          onChangeText={ setLocation }
          placeholder="Location"
          placeholderTextColor="darkgray"
          h={ 48 }
          p={ 14 }
        />
      </VStack>

      <VStack gap={ 5 }>
        <Text ml={ 10 } fontSize={ 14 } color="gray">Start Date & Time</Text>
        <DateTimePicker onChange={onChangeStartDate} currentDate={startDate}/>
      </VStack>

      <VStack gap={ 5 }>
        <Text ml={ 10 } fontSize={ 14 } color="gray">End Date & Time</Text>
        <DateTimePicker onChange={onChangeEndDate} currentDate={endDate}/>
      </VStack>

      <Button
        mt={ "auto" }
        isLoading={ isSubmitting }
        disabled={ isSubmitting }
        onPress={ onSubmit }
      >
        Save
      </Button>

    </VStack>
  );
}
