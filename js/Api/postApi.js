import {apiClient} from './apiClient.js';

export const CreatePost = (content, tags = [], images = []) => {
    if (images.length > 0) {
        const formData = new FormData();
        if (content)
            formData.append('Content', content);

        if (tags.length > 0)
            tags.forEach(tag => formData.append('Tags', tag));
        
        if (images.length > 0)
            images.forEach(image => formData.append('Images', image));

        return apiClient('/Posts', {
            auth: true,
            method: 'POST',
            body: formData,
            formData: true
        });
    }

    return apiClient('/Posts', {
        auth: true,
        method: 'POST',
        body: {
            "Content": content,
            "Tags": tags
        }
    });
}

export const GetPosts = (page = 1, pageSize = 10) =>
    apiClient(`/Feed?page=${page}&pageSize=${pageSize}`, { auth: true });