/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import * as React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import type { RemoteMessage } from 'react-native-firebase';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const App: () => React$Node = () => {
  const [fcmToken, setFcmToken] = React.useState(null);
  const [permission, setPermission] = React.useState(null);
  const [message, setMessage] = React.useState([]);

  React.useEffect(() => {
    async function initFirebase() {
      // #1
      const checkFcmToken = await messaging().getToken();
      if (checkFcmToken) {
        setFcmToken(checkFcmToken);
        console.log('checkFcmToken', checkFcmToken);
      } else {
        setFcmToken('NO TOKEN');
      }

      // #2
      const checkPermission = await messaging().hasPermission();
      if (checkPermission) {
        setPermission(checkPermission.toString());
      } else {
        try {
          const requestPermission = await messaging().requestPermission();
          if (requestPermission) {
            setPermission(requestPermission.toString());
          } else {
            setPermission('NO PERMISSION');
          }
          // User has authorised
        } catch (error) {
          // User has rejected permissions
          setPermission('NO PERMISSION');
        }
      }
    }
    initFirebase();

    // #3
    const messageListener = messaging().onMessage(
      (newMessage: RemoteMessage) => {
        const Messages = message;
        console.log('Messages', Messages);
        Messages.push(newMessage);
        console.log('ADA MESSAGE', newMessage);
        setMessage([...Messages]);
      },
    );

    // #4
    const onTokenRefreshListener = messaging().onTokenRefresh(fcmToken => {
      if (fcmToken) {
        setFcmToken(fcmToken);
        console.log('fcmToken', fcmToken);
      } else {
        setFcmToken('NO TOKEN');
      }
    });

    return () => {
      messageListener();
      onTokenRefreshListener();
    };
  }, []);

  async function handleSendMessage() {
    console.log('HIYA');
    const targetDeviceToken =
      'cWGy6niJjh0:APA91bE146rN7B-snokgjzEAZ0820SNLdNTa0TSkgAl4Gw0pv8BUu1q-6UuBAB3ATrshA_AFYom6xk2GcNkUJW2uznc7-kAoRleHixJVvX4Ab3fZO1mHbA4rEEg0JDZzigL-_wYggH8y';
    const message = {
      registration_ids: [targetDeviceToken],
      notification: {
        title: 'BUYER',
        body: 'You have a new friend suggestion',
        vibrate: 1,
        sound: 1,
        show_in_foreground: true,
        priority: 'high',
        content_available: true,
      },
    };
    // const messageResult = await firebase.firestore().sendMessage(message);
    await messaging()
      .sendMessage(message)
      .then(response => console.log('ok', response))
      .catch(e => console.log('error', e));
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.sectionContainer}>
            <Text style={styles.header}>BUYER</Text>
          </View>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>FCM TOKEN</Text>
              <Text style={styles.sectionDescription}>{fcmToken}</Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>PERMISSION</Text>
              <Text style={styles.sectionDescription}>{permission}</Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>MESSAGE</Text>
              <Text>...</Text>
              {message.length > 0 ? (
                message.map((item, index) => {
                  return (
                    <View key={index.toString()}>
                      <Text>#{index}</Text>
                      <Text>>{JSON.stringify(item)}</Text>
                    </View>
                  );
                })
              ) : (
                <Text>MESSAGE EMPTY</Text>
              )}
              <Text>...</Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>SEND MESSAGE</Text>
              <Button
                title="SEND"
                color="#f194ff"
                onPress={handleSendMessage}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    padding: 16,
    textAlign: 'center',
    color: Colors.dark,
  },
});

export default App;
