import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

export default function ChatScreen({ navigation }) {
    const [message, setMessage] = useState('');

    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hi, Thank you for showing interest.',
            sender: 'other',
            time: '10:30 AM',
        },
        {
            id: '2',
            text: 'Hello Swathi, Nice to connect with you.',
            sender: 'me',
            time: '10:31 AM',
        },
        {
            id: '3',
            text: 'How are you?',
            sender: 'other',
            time: '10:32 AM',
        },
    ]);

    const sendMessage = () => {
        if (!message.trim()) {
            return;
        }

        const newMessage = {
            id: Date.now().toString(),
            text: message,
            sender: 'me',
            time: 'Now',
        };

        setMessages([...messages, newMessage]);
        setMessage('');
    };

    const renderMessage = ({ item }) => {
        const isMe = item.sender === 'me';

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMe
                        ? styles.rightAlign
                        : styles.leftAlign,
                ]}>
                <View
                    style={[
                        styles.messageBubble,
                        isMe
                            ? styles.myMessage
                            : styles.otherMessage,
                    ]}>
                    <Text
                        style={[
                            styles.messageText,
                            isMe && { color: '#FFF' },
                        ]}>
                        {item.text}
                    </Text>

                    <Text
                        style={[
                            styles.timeText,
                            isMe && { color: '#FFF' },
                        ]}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather
                        name="arrow-left"
                        size={22}
                        color="#FFF"
                    />
                </TouchableOpacity>

                <Image
                    source={{
                        uri: 'https://randomuser.me/api/portraits/women/44.jpg',
                    }}
                    style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        Swathi Mudiraj
                    </Text>

                    <Text style={styles.online}>
                        Online
                    </Text>
                </View>

                <TouchableOpacity>
                    <Feather
                        name="more-vertical"
                        size={22}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </View>

            {/* Chat */}

            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={{
                    padding: 15,
                }}
            />

            {/* Input */}

            <View style={styles.inputContainer}>
                {/* <TouchableOpacity>
                    <Feather
                        name="smile"
                        size={22}
                        color="#999"
                    />
                </TouchableOpacity> */}

                <TextInput
                    placeholder="Type a message..."
                    value={message}
                    onChangeText={setMessage}
                    style={styles.input}
                />

                {/* <TouchableOpacity>
                    <Feather
                        name="paperclip"
                        size={22}
                        color="#999"
                    />
                </TouchableOpacity> */}

                <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={sendMessage}>
                    <Feather
                        name="send"
                        size={18}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },

    header: {
        height: 80,
        backgroundColor: '#E30613',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },

    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22,
        marginHorizontal: 12,
    },

    name: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },

    online: {
        color: '#FFF',
        fontSize: 12,
        opacity: 0.8,
    },

    messageContainer: {
        marginBottom: 10,
    },

    leftAlign: {
        alignItems: 'flex-start',
    },

    rightAlign: {
        alignItems: 'flex-end',
    },

    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },

    otherMessage: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 4,
    },

    myMessage: {
        backgroundColor: '#E30613',
        borderTopRightRadius: 4,
    },

    messageText: {
        fontSize: 15,
        color: '#222',
    },

    timeText: {
        fontSize: 11,
        color: '#666',
        alignSelf: 'flex-end',
        marginTop: 5,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },

    input: {
        flex: 1,
        height: 45,
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        marginHorizontal: 10,
        paddingHorizontal: 15,
    },

    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#E30613',
        justifyContent: 'center',
        alignItems: 'center',
    },
});