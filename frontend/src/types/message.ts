export interface Message {
    id: number;
    content: string;
    from: string;
    senderId: string;
    receiverId: string;
    createdAt: Date;
}