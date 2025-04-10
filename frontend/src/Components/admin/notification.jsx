import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, Card, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const AdminNotifications = ({ darkMode }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCreateNotification = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            await axios.post('http://localhost:3001/notification/broadcast', values, {
                headers: { accessToken: token }
            });

            message.success('Notification created and sent to all users!');
            form.resetFields();
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 403) {
                message.error('Admin privileges required to send notifications');
            } else {
                message.error(error.response?.data?.error || 'Failed to create notification');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="max-w-2xl mx-auto">
                <Card
                    title={
                        <div className="flex items-center">
                            <BellOutlined className="mr-2 text-xl" />
                            <span className={`text-xl font-semibold ${darkMode ? 'text-black' : 'text-gray-800'}`}>
                                Create New Notification
                            </span>
                        </div>
                    }
                    className={`shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleCreateNotification}
                        initialValues={{ title: '', content: '' }}
                    >
                        <Form.Item
                            label={<span className={darkMode ? "text-gray-300" : ""}>Title</span>}
                            name="title"
                            rules={[{ 
                                required: true, 
                                message: 'Please enter a title' 
                            }]}
                        >
                            <Input 
                                placeholder="Important Update"
                                className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                maxLength={100}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className={darkMode ? "text-gray-300" : ""}>Message</span>}
                            name="content"
                            rules={[{ 
                                required: true, 
                                message: 'Please enter the notification content' 
                            }]}
                        >
                            <Input.TextArea
                                rows={5}
                                placeholder="Write your notification message here..."
                                className={darkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                className={`${
                                    darkMode ? 
                                    'bg-blue-600 hover:bg-blue-700 border-blue-800' : 
                                    'bg-blue-500 hover:bg-blue-600 border-blue-600'
                                } text-white font-semibold`}
                            >
                                Send Notification to All Users
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>📢 This notification will be sent to all registered users</p>
                        <p>⏳ Messages are limited to 500 characters</p>
                        <p>🔔 Users will see this in their notifications panel</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminNotifications;
