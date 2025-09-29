import axios from 'axios';

const HUGGING_FACE_API_BASE = 'https://huggingface.co/api';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    [key: string]: unknown;
}

export async function validateAccessToken(token: string): Promise<UserProfile> {
    if (!token || typeof token !== 'string') {
        throw new Error('Access token must be a non-empty string.');
    }

    try {
        const response = await axios.get(`${HUGGING_FACE_API_BASE}/whoami-v2`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = response.data as UserProfile;
        if (!data.id || !data.name) {
            throw new Error('Invalid user profile data returned.');
        }

        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error('The provided access token is invalid or has expired.');
        }
        throw new Error(`Failed to validate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
