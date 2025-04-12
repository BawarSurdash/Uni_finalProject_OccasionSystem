import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Rate, Empty, Modal, Button, Spin, Card, Select, Badge } from 'antd';
import { EyeOutlined, FilterOutlined, BarChartOutlined } from '@ant-design/icons';

const { Option } = Select;

const Feedback = ({ darkMode }) => {
    const [feedbackData, setFeedbackData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [postDetails, setPostDetails] = useState(null);
    const [loadingPostDetails, setLoadingPostDetails] = useState(false);
    const [feedbackSummary, setFeedbackSummary] = useState([]);
    const [selectedPostFilter, setSelectedPostFilter] = useState('all');
    const [showSummary, setShowSummary] = useState(true);

    const showPostDetails = async (postId) => {
        setSelectedPost(postId);
        setIsModalVisible(true);
        setLoadingPostDetails(true);
        try {
            // Get post details
            const postResponse = await axios.get(`http://localhost:3001/posts/${postId}`);
            const post = postResponse.data;
            
            // Get feedback for this post to calculate statistics
            const feedbackResponse = await axios.get(`http://localhost:3001/feedback/post/${postId}`);
            const postFeedback = feedbackResponse.data;
            
            // Calculate average rating
            let averageRating = 0;
            if (postFeedback && postFeedback.length > 0) {
                const sum = postFeedback.reduce((total, feedback) => total + feedback.rating, 0);
                averageRating = sum / postFeedback.length;
            }
            
            // Add calculated statistics to post details
            const postWithStats = {
                ...post,
                feedbackCount: postFeedback ? postFeedback.length : 0,
                averageRating: averageRating,
                feedbackList: postFeedback || []
            };
            
            setPostDetails(postWithStats);
        } catch (error) {
            console.error('Error fetching post details:', error);
        } finally {
            setLoadingPostDetails(false);
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedPost(null);
        setPostDetails(null);
    };
    
    const generateFeedbackSummary = (data) => {
        const summary = {};
        
        // Count feedback by post
        data.forEach(feedback => {
            const postId = feedback.PostId;
            const postTitle = feedback.Post?.title || 'Unknown Post';
            const postCategory = feedback.Post?.category || 'Unknown';
            
            if (!summary[postId]) {
                summary[postId] = {
                    id: postId,
                    title: postTitle,
                    category: postCategory,
                    count: 0,
                    totalRating: 0
                };
            }
            
            summary[postId].count += 1;
            summary[postId].totalRating += feedback.rating;
        });
        
        // Convert to array and calculate average ratings
        const summaryArray = Object.values(summary).map(item => ({
            ...item,
            averageRating: item.totalRating / item.count
        }));
        
        // Sort by number of feedback (descending)
        return summaryArray.sort((a, b) => b.count - a.count);
    };

    const columns = [
        {
            title: 'User',
            dataIndex: ['User', 'username'],
            key: 'user',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : ''}`}>{record.User.username}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{record.User.email}</span>
                </div>
            )
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Rate disabled defaultValue={rating} className={darkMode ? 'ant-rate-dark' : ''} />
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
            className: darkMode ? 'text-gray-300' : '',
            render: (text) => (
                <div className={`max-w-md truncate ${darkMode ? 'text-gray-300' : ''}`}>
                    {text || <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>No comment</span>}
                </div>
            )
        },
        {
            title: 'Post',
            dataIndex: ['Post', 'title'],
            key: 'post',
            render: (text, record) => (
                <div className="flex items-center justify-between">
                    <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : ''}`}>{record.Post.title}</span>
                        <Tag color={darkMode ? 'blue' : 'geekblue'} className="ml-2">
                            {record.Post.category}
                        </Tag>
                    </div>
                    <Button 
                        type="link" 
                        icon={<EyeOutlined />} 
                        onClick={() => showPostDetails(record.Post.id)}
                        className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}
                    >
                        View
                    </Button>
                </div>
            )
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString(),
            className: darkMode ? 'text-gray-300' : ''
        }
    ];

    useEffect(() => {
        const fetchFeedback = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:3001/feedback/all');
                setFeedbackData(response.data);
                
                // Generate summary data
                const summary = generateFeedbackSummary(response.data);
                setFeedbackSummary(summary);
            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const formatCurrency = (value) => {
        return `$${parseFloat(value).toFixed(2)}`;
    };
    
    // Filter feedback data based on selected post
    const filteredFeedbackData = selectedPostFilter === 'all' 
        ? feedbackData 
        : feedbackData.filter(item => item.PostId === parseInt(selectedPostFilter));
    
    const toggleSummary = () => {
        setShowSummary(!showSummary);
    };

    return (
        <div className={darkMode ? 'bg-gray-800 text-gray-200 rounded-lg p-4' : 'bg-white rounded-lg p-4'}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Customer Feedback
                </h2>
                <Button 
                    type="default"
                    icon={<BarChartOutlined />}
                    onClick={toggleSummary}
                    className={darkMode ? 'border-gray-600 text-gray-300' : ''}
                >
                    {showSummary ? 'Hide Summary' : 'Show Summary'}
                </Button>
            </div>
            
            {/* Feedback Summary Section */}
            {showSummary && (
                <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Feedback by Post
                        </h3>
                        <div className="flex items-center">
                            <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <FilterOutlined /> Filter:
                            </span>
                            <Select 
                                value={selectedPostFilter} 
                                onChange={(value) => setSelectedPostFilter(value)}
                                className={`w-64 ${darkMode ? 'ant-select-dark' : ''}`}
                                dropdownClassName={darkMode ? 'ant-dropdown-dark' : ''}
                            >
                                <Option value="all">All Posts</Option>
                                {feedbackSummary.map(post => (
                                    <Option key={post.id} value={post.id.toString()}>
                                        {post.title} ({post.count} reviews)
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {feedbackSummary.map(post => (
                            <Card 
                                key={post.id} 
                                className={`${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white'}`}
                                size="small"
                                title={
                                    <div className="flex items-center justify-between">
                                        <div className="truncate mr-2">{post.title}</div>
                                        <Badge 
                                            count={post.count} 
                                            className={darkMode ? 'site-badge-count-dark' : ''}
                                            style={{ backgroundColor: post.count > 5 ? '#52c41a' : '#1890ff' }}
                                        />
                                    </div>
                                }
                                bodyStyle={{ padding: '12px' }}
                                actions={[
                                    <Button 
                                        type="link" 
                                        size="small" 
                                        icon={<EyeOutlined />} 
                                        onClick={() => {
                                            showPostDetails(post.id);
                                        }}
                                        className={darkMode ? 'text-blue-400' : ''}
                                    >
                                        View Details
                                    </Button>,
                                    <Button 
                                        type="link" 
                                        size="small" 
                                        onClick={() => setSelectedPostFilter(post.id.toString())}
                                        className={darkMode ? 'text-green-400' : 'text-green-600'}
                                    >
                                        Filter
                                    </Button>
                                ]}
                            >
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Category:</span>
                                        <Tag color={darkMode ? 'blue' : 'blue'}>{post.category}</Tag>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Reviews:</span>
                                        <span className="font-medium">{post.count}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Rating:</span>
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">{post.averageRating.toFixed(1)}</span>
                                            <Rate 
                                                disabled 
                                                defaultValue={Math.round(post.averageRating)} 
                                                className={darkMode ? 'ant-rate-dark' : ''} 
                                                style={{ fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            
            <Table
                columns={columns}
                dataSource={filteredFeedbackData}
                loading={loading}
                rowKey="id"
                pagination={{ 
                    pageSize: 8,
                    position: ['bottomRight'],
                    showSizeChanger: false
                }}
                locale={{
                    emptyText: <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                No feedback received yet
                            </span>
                        }
                    />
                }}
                className={`${darkMode ? 'dark-table' : ''}`}
                rowClassName={() => darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-50'}
            />

            {/* Post Details Modal */}
            <Modal
                title={
                    <div className={darkMode ? 'text-gray-100' : ''}>
                        Post Details
                    </div>
                }
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="close" onClick={handleModalClose}>
                        Close
                    </Button>
                ]}
                className={darkMode ? 'dark-modal' : ''}
            >
                {loadingPostDetails ? (
                    <div className="flex justify-center p-8">
                        <Spin size="large" />
                    </div>
                ) : postDetails ? (
                    <div className={darkMode ? 'text-gray-200' : ''}>
                        <div className="mb-4">
                            {postDetails.image && (
                                <img 
                                    src={postDetails.image} 
                                    alt={postDetails.title} 
                                    className="w-full h-56 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                {postDetails.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                                <Tag color={darkMode ? 'blue' : 'geekblue'}>
                                    {postDetails.category}
                                </Tag>
                                {postDetails.isSpecial && (
                                    <Tag color={darkMode ? 'orange' : 'orange'}>
                                        Special Offer
                                    </Tag>
                                )}
                            </div>
                        </div>
                        
                        <div className={`grid grid-cols-2 gap-4 mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <div>
                                <p><span className="font-medium">Base Price:</span> {formatCurrency(postDetails.basePrice)}</p>
                                <p><span className="font-medium">Created:</span> {new Date(postDetails.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p><span className="font-medium">ID:</span> {postDetails.id}</p>
                                <p><span className="font-medium">Updated:</span> {new Date(postDetails.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</h4>
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                {postDetails.description || 'No description available.'}
                            </p>
                        </div>
                        
                        {postDetails.isSpecial && postDetails.specialFeatures && (
                            <div className="mb-4">
                                <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Special Features</h4>
                                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    {postDetails.specialFeatures}
                                </p>
                            </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Feedback Statistics</h4>
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {postDetails.averageRating ? parseFloat(postDetails.averageRating).toFixed(1) : 'N/A'}
                                    </span>
                                    <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        out of 5
                                    </span>
                                </div>
                                <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    Based on {postDetails.feedbackCount || 0} reviews
                                </div>
                            </div>
                            
                            {/* List of feedback for this post */}
                            {postDetails.feedbackList && postDetails.feedbackList.length > 0 && (
                                <div className="mt-4">
                                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        All Reviews ({postDetails.feedbackList.length})
                                    </h5>
                                    <div className={`max-h-40 overflow-y-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-md p-2`}>
                                        {postDetails.feedbackList.map((feedback) => (
                                            <div 
                                                key={feedback.id} 
                                                className={`p-2 mb-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'border-gray-700' : 'border-gray-200'} border`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center">
                                                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                            {feedback.User?.username || 'Anonymous'}
                                                        </span>
                                                        <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {new Date(feedback.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Rate 
                                                            disabled 
                                                            defaultValue={feedback.rating} 
                                                            className={darkMode ? 'ant-rate-dark' : ''} 
                                                            style={{ fontSize: '14px' }}
                                                        />
                                                    </div>
                                                </div>
                                                {feedback.comment && (
                                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {feedback.comment}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No details available for this post.
                    </div>
                )}
            </Modal>

            {/* Add dark mode styling for the Ant Design table */}
            {darkMode && (
                <style jsx="true">{`
                    /* Header styles for dark mode */
                    .dark-table .ant-table-thead > tr > th {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                        border-bottom: 1px solid #374151 !important;
                    }
                    
                    /* Body styles for dark mode */
                    .dark-table .ant-table-tbody > tr > td {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                        border-bottom: 1px solid #374151 !important;
                    }
                    
                    /* Hover styles */
                    .dark-table .ant-table-tbody > tr.ant-table-row:hover > td {
                        background-color: #374151 !important;
                    }
                    
                    /* Pagination styles */
                    .dark-table .ant-pagination .ant-pagination-item-active {
                        background-color: #3b82f6 !important;
                        border-color: #3b82f6 !important;
                    }
                    
                    .dark-table .ant-pagination .ant-pagination-item-active a {
                        color: white !important;
                    }
                    
                    .dark-table .ant-pagination .ant-pagination-item a,
                    .dark-table .ant-pagination .ant-pagination-prev button,
                    .dark-table .ant-pagination .ant-pagination-next button {
                        color: #e5e7eb !important;
                    }
                    
                    /* Stars/rating styles */
                    .ant-rate-dark .ant-rate-star:not(.ant-rate-star-full) .ant-rate-star-second {
                        color: rgba(255, 255, 255, 0.2) !important;
                    }
                    
                    /* Empty data styling */
                    .dark-table .ant-empty-description {
                        color: #9ca3af !important;
                    }
                    
                    .dark-table .ant-empty-img-simple-ellipse {
                        fill: #4b5563 !important;
                    }
                    
                    .dark-table .ant-empty-img-simple-g {
                        stroke: #6b7280 !important;
                    }
                    
                    .dark-table .ant-empty-img-simple-path {
                        fill: #374151 !important;
                    }
                    
                    /* Modal dark mode styling */
                    .dark-modal .ant-modal-content {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                    }
                    
                    .dark-modal .ant-modal-header {
                        background-color: #1f2937 !important;
                        border-bottom: 1px solid #374151 !important;
                    }
                    
                    .dark-modal .ant-modal-title {
                        color: #e5e7eb !important;
                    }
                    
                    .dark-modal .ant-modal-close {
                        color: #e5e7eb !important;
                    }
                    
                    .dark-modal .ant-modal-footer {
                        border-top: 1px solid #374151 !important;
                    }
                    
                    /* Select dropdown dark mode */
                    .ant-dropdown-dark {
                        background-color: #1f2937 !important;
                        border: 1px solid #374151 !important;
                        box-shadow: 0 3px 6px -4px rgba(0,0,0,0.48) !important;
                    }
                    
                    .ant-dropdown-dark .ant-select-item {
                        color: #e5e7eb !important;
                    }
                    
                    .ant-dropdown-dark .ant-select-item-option-selected {
                        background-color: #374151 !important;
                    }
                    
                    .ant-dropdown-dark .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                        background-color: #4b5563 !important;
                    }
                    
                    .ant-select-dark .ant-select-selector {
                        background-color: #1f2937 !important;
                        border-color: #374151 !important;
                        color: #e5e7eb !important;
                    }
                    
                    .site-badge-count-dark .ant-badge-count {
                        box-shadow: 0 0 0 1px #1f2937 !important;
                    }
                    
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
                    
                    .ant-card-actions {
                        background-color: #111827 !important;
                        border-top-color: #374151 !important;
                    }
                    
                    .ant-card-actions > li {
                        border-right-color: #374151 !important;
                    }
                    
                    .ant-tag-blue {
                        background: #1d4ed8 !important;
                        border-color: #2563eb !important;
                        color: white !important;
                    }
                `}</style>
            )}
        </div>
    );
};

export default Feedback;
