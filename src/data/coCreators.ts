export interface CoCreator {
  id: string;
  name: string;
  role: string;
  joinDate: string;
  feedback: number;
  appearances: string;
  description: string;
  avatar: string;
  tagClass: string;
}

export const coCreators: CoCreator[] = [
  {
    id: 'Co-001',
    name: 'Co-001',
    role: '产品设计师',
    joinDate: '2023.09',
    feedback: 5,
    appearances: '1, 2, 3',
    description: '一位产品设计师，对精确性有近乎宗教的执着。',
    avatar: '🌱',
    tagClass: 'tag-self-care',
  },
  {
    id: 'Co-007',
    name: 'Co-007',
    role: '自由编辑者',
    joinDate: '2023.10',
    feedback: 7,
    appearances: '2, 4, 5',
    description: '自由编辑者，在创意流和身体疲劳之间不断震荡。',
    avatar: '🌿',
    tagClass: 'tag-productivity',
  },
  {
    id: 'Co-013',
    name: 'Co-013',
    role: '工程师',
    joinDate: '2023.11',
    feedback: 8,
    appearances: '2, 3, 6',
    description: '工程师，喜欢理解底层逻辑，讨厌表面化的解决方案。',
    avatar: '🌿',
    tagClass: 'tag-relationship',
  },
  {
    id: 'Co-015',
    name: 'Co-015',
    role: '产品经理',
    joinDate: '2023.11',
    feedback: 6,
    appearances: '1, 4, 7',
    description: '产品经理，需要处理大量模糊需求和人际冲突。',
    avatar: '🌿',
    tagClass: 'tag-reading',
  },
  {
    id: 'Co-023',
    name: 'Co-023',
    role: '视觉设计师',
    joinDate: '2023.12',
    feedback: 9,
    appearances: '2, 5, 6, 8',
    description: '视觉设计师，用色彩和形状思考，但不善于言语表达。',
    avatar: '🌳',
    tagClass: 'tag-entertainment',
  },
  {
    id: 'Co-028',
    name: 'Co-028',
    role: '心理咨询师',
    joinDate: '2024.01',
    feedback: 4,
    appearances: '1, 3',
    description: '心理咨询师，正在思考如何将这个系统用于临床。',
    avatar: '🌱',
    tagClass: 'tag-self-care',
  },
  {
    id: 'Co-042',
    name: 'Co-042',
    role: '企业教练',
    joinDate: '2024.02',
    feedback: 11,
    appearances: '3, 4, 5, 6, 7',
    description: '企业教练，看到了这个系统对团队动力的启示。',
    avatar: '🌳',
    tagClass: 'tag-body',
  },
  {
    id: 'Co-051',
    name: 'Co-051',
    role: '学生',
    joinDate: '2024.03',
    feedback: 3,
    appearances: '1, 2',
    description: '学生，正在用这个系统理解自己的学习节奏。',
    avatar: '🌱',
    tagClass: 'tag-learning',
  },
];
