import {
  taste1, taste10, taste11, taste12, taste13,
  taste14, taste15, taste16, taste17, taste18,
  taste19, taste2, taste20, taste21, taste22,
  taste23, taste3, taste4, taste5, taste6,
  taste7, taste8, taste9
} from "~/assets/images/taste";

export const interestTagData = [
  { title: "빵식가", isClick: false, url: taste1 }, { title: "건강식", isClick: false, url: taste2 },
  { title: "다이어터", isClick: false, url: taste3 }, { title: "비건", isClick: false, url: taste4 },
  { title: "애주가", isClick: false, url: taste5 }, { title: "디저트러버", isClick: false, url: taste9 },
  { title: "육식파", isClick: false, url: taste8 }, { title: `해산물\n매니아`, isClick: false, url: taste6 },
  { title: `향신료\n좋아`, isClick: false, url: taste7 }, { title: `초딩\n입맛`, isClick: false, url: taste14 },
  { title: `아재\n입맛`, isClick: false, url: taste13 }, { title: `할매\n입맛`, isClick: false, url: taste10 },
  { title: `대식가`, isClick: false, url: taste11 }, { title: `소식좌`, isClick: false, url: taste12 },
  { title: `달달`, isClick: false, url: taste15 }, { title: `단짠\n단짠`, isClick: false, url: taste16 },
  { title: `맵고수`, isClick: false, url: taste17 }, { title: `느끼 좋아`, isClick: false, url: taste18 },
  { title: `신상\n탐험가`, isClick: false, url: taste23 }, { title: `일편단심\n늘먹던거`, isClick: false, url: taste22 },
  { title: `가성비파`, isClick: false, url: taste21 }, { title: "간편식", isClick: false, url: taste20 },
  { title: `식재료\n수집가`, isClick: false, url: taste19 },
];

export const initialBadgeData = {
  foodStyle:
    [{ title: "간단함파", isClick: false }, { title: "직접요리파", isClick: false }, { title: "건강추구파", isClick: false },
    { title: "가성비좋아", isClick: false }, { title: "비싸도FLEX", isClick: false }, { title: "이색파", isClick: false }],
  household:
    [{ title: "1인가구", isClick: false }, { title: "2인가구", isClick: false }, { title: "3인이상가구", isClick: false }],
  occupation:
    [{ title: "학생", isClick: false }, { title: "직장인", isClick: false }, { title: "주부", isClick: false },
    { title: "기타", isClick: false, content: "" }],
  taste: [
    { title: "느끼만렙", isClick: false },
    { title: "맵찔이", isClick: false },
    { title: "맵고수", isClick: false },
    { title: "달달함파", isClick: false },
    { title: "짭조름파", isClick: false }
  ]
};
