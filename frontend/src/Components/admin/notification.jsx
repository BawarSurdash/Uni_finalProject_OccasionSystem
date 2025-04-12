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
                            <span className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
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
                                className={darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : ''}
                                maxLength={100}
                                style={darkMode ? { backgroundColor: '#374151', borderColor: '#4B5563', color: 'white' } : {}}
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
                                className={darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : ''}
                                maxLength={500}
                                showCount
                                style={darkMode ? { backgroundColor: '#374151', borderColor: '#4B5563', color: 'white' } : {}}
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
            
            {/* Add dark mode styling for Ant Design components */}
            {darkMode && (
                <style jsx="true">{`
                    /* Card dark mode styling */
                    .ant-card {
                        background-color: #1f2937 !important;
                        border-color: #374151 !important;
                    }
                    
                    .ant-card-head {
                        background-color: #1f2937 !important;
                        border-bottom-color: #374151 !important;
                        color: #e5e7eb !important;
                    }
                    
                    .ant-card-head-title,
                    .ant-card-meta-title {
                        color: #e5e7eb !important;
                    }
                    
                    .ant-card-body {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                    }
                    
                    /* Form styling */
                    .ant-form-item-label > label {
                        color: #e5e7eb !important;
                    }
                    
                    .ant-form-item-explain-error {
                        color: #ef4444 !important;
                    }
                    
                    /* Input count styling */
                    .ant-input-textarea-show-count::after {
                        color: #9ca3af !important;
                    }
                    
                    /* Button styling */
                    .ant-btn-primary {
                        background-color: #2563eb !important;
                        border-color: #3b82f6 !important;
                    }
                    
                    .ant-btn-primary:hover {
                        background-color: #1d4ed8 !important;
                        border-color: #2563eb !important;
                    }
                    
                    /* Message notification styling */
                    .ant-message-notice-content {
                        background-color: #1f2937 !important;
                        box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.48) !important;
                    }
                    
                    .ant-message-success .anticon,
                    .ant-message-success .ant-message-custom-content {
                        color: #10b981 !important;
                    }
                    
                    .ant-message-error .anticon,
                    .ant-message-error .ant-message-custom-content {
                        color: #ef4444 !important;
                    }
                    
                    /* Input field styling */
                    .ant-input {
                        background-color: #374151 !important;
                        border-color: #4B5563 !important;
                        color: white !important;
                    }
                    
                    .ant-input::placeholder {
                        color: #9CA3AF !important;
                    }
                    
                    .ant-input:hover, .ant-input:focus {
                        border-color: #3B82F6 !important;
                    }
                    
                    .ant-input-textarea {
                        background-color: #374151 !important;
                    }
                    
                    .ant-input-textarea textarea {
                        background-color: #374151 !important;
                        border-color: #4B5563 !important;
                        color: white !important;
                    }
                `}</style>
            )}
        </div>
    );
};

export default AdminNotifications;
