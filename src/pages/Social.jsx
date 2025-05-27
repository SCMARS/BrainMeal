import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Avatar,
    Button,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Comment as CommentIcon,
    Share as ShareIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

export default function Social() {
    const { t } = useLanguage();
    const [tabValue, setTabValue] = useState(0);
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'John Doe',
            avatar: 'https://via.placeholder.com/40',
            content: 'Just finished my morning workout! Feeling great! 💪',
            likes: 12,
            comments: 3,
            timestamp: '2 hours ago',
            liked: false,
        },
        {
            id: 2,
            author: 'Jane Smith',
            avatar: 'https://via.placeholder.com/40',
            content: 'Check out my new healthy meal prep for the week! 🥗',
            likes: 8,
            comments: 5,
            timestamp: '4 hours ago',
            liked: true,
        },
    ]);

    const [followers] = useState([
        { id: 1, name: 'Alice Johnson', avatar: 'https://via.placeholder.com/40' },
        { id: 2, name: 'Bob Wilson', avatar: 'https://via.placeholder.com/40' },
    ]);

    const [following] = useState([
        { id: 3, name: 'Carol Brown', avatar: 'https://via.placeholder.com/40' },
        { id: 4, name: 'David Lee', avatar: 'https://via.placeholder.com/40' },
    ]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleLike = (postId) => {
        setPosts(
            posts.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          liked: !post.liked,
                          likes: post.liked ? post.likes - 1 : post.likes + 1,
                      }
                    : post
            )
        );
    };

    const handleShare = (postId) => {
        // Implement share functionality
        console.log('Sharing post:', postId);
    };

    const handleComment = (postId) => {
        // Implement comment functionality
        console.log('Commenting on post:', postId);
    };

    const handleCreatePost = () => {
        if (newPost.trim()) {
            setPosts([
                {
                    id: Date.now(),
                    author: 'Current User',
                    avatar: 'https://via.placeholder.com/40',
                    content: newPost,
                    likes: 0,
                    comments: 0,
                    timestamp: 'Just now',
                    liked: false,
                },
                ...posts,
            ]);
            setNewPost('');
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('social')}
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder={t('whatOnYourMind')}
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                    >
                        {t('post')}
                    </Button>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            {posts.map((post) => (
                                <Box key={post.id}>
                                    <CardHeader
                                        avatar={<Avatar src={post.avatar} />}
                                        title={post.author}
                                        subheader={post.timestamp}
                                    />
                                    <CardContent>
                                        <Typography variant="body1">{post.content}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            onClick={() => handleLike(post.id)}
                                            color={post.liked ? 'primary' : 'default'}
                                        >
                                            {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                        <Typography variant="body2" sx={{ mr: 2 }}>
                                            {post.likes}
                                        </Typography>
                                        <IconButton onClick={() => handleComment(post.id)}>
                                            <CommentIcon />
                                        </IconButton>
                                        <Typography variant="body2" sx={{ mr: 2 }}>
                                            {post.comments}
                                        </Typography>
                                        <IconButton onClick={() => handleShare(post.id)}>
                                            <ShareIcon />
                                        </IconButton>
                                    </CardActions>
                                    <Divider />
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                                <Tab label={t('followers')} />
                                <Tab label={t('following')} />
                            </Tabs>
                            <List>
                                {tabValue === 0
                                    ? followers.map((follower) => (
                                          <ListItem key={follower.id}>
                                              <ListItemAvatar>
                                                  <Avatar src={follower.avatar} />
                                              </ListItemAvatar>
                                              <ListItemText primary={follower.name} />
                                              <ListItemSecondaryAction>
                                                  <IconButton edge="end">
                                                      <PersonRemoveIcon />
                                                  </IconButton>
                                              </ListItemSecondaryAction>
                                          </ListItem>
                                      ))
                                    : following.map((follow) => (
                                          <ListItem key={follow.id}>
                                              <ListItemAvatar>
                                                  <Avatar src={follow.avatar} />
                                              </ListItemAvatar>
                                              <ListItemText primary={follow.name} />
                                              <ListItemSecondaryAction>
                                                  <IconButton edge="end">
                                                      <PersonAddIcon />
                                                  </IconButton>
                                              </ListItemSecondaryAction>
                                          </ListItem>
                                      ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 