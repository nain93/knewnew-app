export interface RecommentType {
  child: Array<{
    id: number;
    author: {
      id: number;
      nickname: string;
      profileImage: string;
    };
    content: string;
    created: string;
    likeCount: number;
  }>
}

export interface CommentListType {
  id: number;
  author: {
    id: number;
    nickname: string;
    profileImage: string;
  };
  content: string;
  created: string;
  likeCount: number;
  childCount: number
  child: Array<{
    id: number;
    author: {
      id: number;
      nickname: string;
      profileImage: string;
    };
    content: string;
    created: string;
    likeCount: number;
  }>
}