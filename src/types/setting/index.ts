export interface NotificationListType {
  id: number,
  image: string | null,
  isRead: boolean,
  link: string,
  message: string,
  title: string,
  created: string,
  type: "review_comment" | "review_comment_like" | "review_child_comment" | "review_bookmark" |
  "review_like" | "review_popular" | "review_recommend" | "review_view" | "follow" | "review_mention" |
  "comment_mention" | "admin_noti" | "general"
}