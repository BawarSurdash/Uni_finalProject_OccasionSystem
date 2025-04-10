import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Space, message, Switch, Popconfirm, Modal, Input } from 'antd';
import { BellOutlined, ExclamationCircleOutlined, ShoppingOutlined } from '@ant-design/icons';

const AdminNotifications = ({ darkMode }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        content: '',
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/notification/admin/orders', {
                headers: { accessToken: token }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching order notifications:', error);
            message.error('Failed to load order notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Function to handle read/unread toggle
    const handleToggleRead = async (record) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/notification/${record.id}/toggle-read`, 
                { read: !record.read },
                { headers: { accessToken: token } }
            );
            
            // Update local state
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification.id === record.id 
                        ? { ...notification, read: !notification.read } 
                        : notification
                )
            );
            
            message.success(`Notification marked as ${!record.read ? 'read' : 'unread'}`);
        } catch (error) {
            console.error('Error toggling read status:', error);
            message.error('Failed to update notification status');
        }
    };

    // Function to batch update read status
    const handleBatchReadStatus = async (markAsRead) => {
        if (selectedRowKeys.length === 0) {
            message.info('No notifications selected');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/notification/batch-update-read', 
                { 
                    ids: selectedRowKeys,
                    read: markAsRead 
                },
                { headers: { accessToken: token } }
            );
            
            // Update local state
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    selectedRowKeys.includes(notification.id)
                        ? { ...notification, read: markAsRead }
                        : notification
                )
            );
            
            message.success(`${selectedRowKeys.length} notification(s) marked as ${markAsRead ? 'read' : 'unread'}`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Error updating notification status:', error);
            message.error('Failed to update notification status');
        }
    };
    
    // Delete a notification
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/notification/${id}`, {
                headers: { accessToken: token }
            });
            
            // Update local state
            setNotifications(prevNotifications => 
                prevNotifications.filter(notification => notification.id !== id)
            );
            
            message.success('Notification deleted successfully');
        } catch (error) {
            console.error('Error deleting notification:', error);
            message.error('Failed to delete notification');
        }
    };
    
    // Delete multiple notifications
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.info('No notifications selected');
            return;
        }
        
        Modal.confirm({
            title: 'Are you sure you want to delete these notifications?',
            icon: <ExclamationCircleOutlined />,
            content: `This will delete ${selectedRowKeys.length} notification(s).`,
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await axios.post('http://localhost:3001/notification/batch-delete', 
                        { ids: selectedRowKeys },
                        { headers: { accessToken: token } }
                    );
                    
                    // Update local state
                    setNotifications(prevNotifications => 
                        prevNotifications.filter(notification => !selectedRowKeys.includes(notification.id))
                    );
                    
                    message.success('Notifications deleted successfully');
                    setSelectedRowKeys([]);
                } catch (error) {
                    console.error('Error deleting notifications:', error);
                    message.error('Failed to delete notifications');
                }
            }
        });
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Create a new broadcast notification
    const handleCreateNotification = () => {
        setIsModalVisible(true);
    };
    
    const handleModalOk = async () => {
        if (!newNotification.title || !newNotification.content) {
            message.error('Please fill in all required fields');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/notification/broadcast', 
                newNotification,
                { headers: { accessToken: token } }
            );
            
            message.success('Notification broadcast to all users');
            setIsModalVisible(false);
            setNewNotification({ title: '', content: '' });
            fetchNotifications();
        } catch (error) {
            console.error('Error creating notification:', error);
            message.error('Failed to create notification');
        }
    };
    
    const handleModalCancel = () => {
        setIsModalVisible(false);
        setNewNotification({ title: '', content: '' });
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNotification(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Updated table columns to match requirements
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '25%',
        },
        {
            title: 'Username',
            dataIndex: 'User',
            key: 'username',
            width: '15%',
            render: (user) => user ? user.username : 'System',
        },
        {
            title: 'Name',
            dataIndex: 'User',
            key: 'name',
            width: '15%',
            render: (user) => user ? `${user.firstName || ''} ${user.lastName || ''}` : 'System',
        },
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
            render: date => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Status',
            dataIndex: 'read',
            key: 'read',
            width: '15%',
            render: (read, record) => (
                <div className="flex items-center space-x-2">
                    <Switch 
                        checked={read} 
                        onChange={() => handleToggleRead(record)}
                        size="small"
                    />
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        read 
                            ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                            : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                    }`}>
                        {read ? 'Read' : 'Unread'}
                    </span>
                </div>
            ),
            filters: [
                { text: 'Read', value: true },
                { text: 'Unread', value: false },
            ],
            onFilter: (value, record) => record.read === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '10%',
            render: (_, record) => (
                <Popconfirm
                    title="Are you sure you want to delete this notification?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button danger size="small">Delete</Button>
                </Popconfirm>
            ),
        },
    ];

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <div className={`p-6 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <ShoppingOutlined className="mr-2" /> Order Notifications
                </h2>
                <div className="space-x-2">
                    <Button
                        type="primary"
                        onClick={handleCreateNotification}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Create Notification
                    </Button>
                    {selectedRowKeys.length > 0 && (
                        <>
                            <Button
                                onClick={() => handleBatchReadStatus(true)}
                                className="bg-green-500 text-white hover:bg-green-600"
                            >
                                Mark as Read ({selectedRowKeys.length})
                            </Button>
                            <Button
                                onClick={() => handleBatchReadStatus(false)}
                                className="bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                                Mark as Unread ({selectedRowKeys.length})
                            </Button>
                            <Button
                                danger
                                onClick={handleBatchDelete}
                            >
                                Delete Selected ({selectedRowKeys.length})
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex justify-between">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Order Notifications</p>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{notifications.length}</p>
                        </div>
                        <div className="p-2 rounded-full bg-blue-500 text-white">
                            <ShoppingOutlined style={{ fontSize: '1.5rem' }} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-100'}`}>
                    <div className="flex justify-between">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Read Notifications</p>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                                {notifications.filter(n => n.read).length}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-green-500 text-white">
                            <i className="fas fa-check-circle text-2xl" />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Unread Notifications</p>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                                {notifications.filter(n => !n.read).length}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-red-500 text-white">
                            <i className="fas fa-bell text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Table */}
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={notifications}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className={`${darkMode ? 'ant-table-dark' : ''} overflow-x-auto`}
                bordered
            />

            {/* Create Notification Modal */}
            <Modal
                title="Create New Notification"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Send Notification"
                cancelText="Cancel"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <Input
                            name="title"
                            value={newNotification.title}
                            onChange={handleInputChange}
                            placeholder="Notification title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <Input.TextArea
                            name="content"
                            value={newNotification.content}
                            onChange={handleInputChange}
                            placeholder="Notification content"
                            rows={4}
                            required
                        />
                    </div>
                    
                </div>
            </Modal>
        </div>
    );
};

export default AdminNotifications;
