// backend/src/scripts/addItems.ts
// 用于添加新项目到数据库的脚本（不会清空现有数据）

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item';

dotenv.config();

// ========================================
// 在这里添加你想要新增的项目
// ========================================
const newItems = [
  // ==================== 景点类 ====================
  {
    category: 'attraction',
    name: '中国科技馆',
    description: '国家级科技馆，集科学普及、科技展览于一体，特别适合亲子游览，有众多互动体验项目。',
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
    ],
    price: 30,
    rating: 4.6,
    location: {
      city: '北京',
      address: '朝阳区北辰东路5号',
      coordinates: [116.390, 39.983]
    },
    tags: ['科技', '教育', '亲子', '互动体验'],
    details: {
      openingHours: '9:30-17:00（周一闭馆）',
      ticketInfo: '成人30元，学生15元',
      highlights: '科学乐园、华夏之光、探索与发现'
    },
    reviews: []
  },
  {
    category: 'attraction',
    name: '欢乐谷',
    description: '北京欢乐谷是大型主题乐园，拥有120余项体验项目，包括40多项游乐设施，是年轻人和家庭游玩的理想选择。',
    images: [
      'https://images.unsplash.com/photo-1505731949168-9842207be771?w=800&q=80',
      'https://images.unsplash.com/photo-1451732401917-66d80311800f?w=800&q=80'
    ],
    price: 299,
    rating: 4.4,
    location: {
      city: '北京',
      address: '朝阳区东四环小武基北路',
      coordinates: [116.494, 39.867]
    },
    tags: ['游乐园', '刺激', '亲子', '娱乐'],
    details: {
      openingHours: '平日 9:30-22:00，周末 9:00-22:00',
      ticketInfo: '全价票299元，儿童票199元',
      facilities: '过山车、激流勇进、4D影院'
    },
    reviews: []
  },
  {
    category: 'attraction',
    name: '雍和宫',
    description: '北京最大的藏传佛教寺院，清朝皇家寺庙，建筑宏伟，香火鼎盛，是祈福参拜的著名场所。',
    images: [
      'https://images.unsplash.com/photo-1540057760370-f3ec1f9ea2f7?w=800&q=80'
    ],
    price: 25,
    rating: 4.5,
    location: {
      city: '北京',
      address: '东城区雍和宫大街12号',
      coordinates: [116.417, 39.947]
    },
    tags: ['寺庙', '宗教', '文化', '建筑'],
    details: {
      openingHours: '夏季 9:00-16:30，冬季 9:00-16:00',
      ticketInfo: '25元/人',
      notes: '需要准备现金购买香火'
    },
    reviews: []
  },
  {
    category: 'attraction',
    name: '什刹海',
    description: '老北京风情的代表区域，包括前海、后海、西海三个湖泊，周边有恭王府、烟袋斜街等景点，是体验老北京文化的好去处。',
    images: [
      'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&q=80'
    ],
    price: 0,
    rating: 4.3,
    location: {
      city: '北京',
      address: '西城区羊房胡同',
      coordinates: [116.382, 39.941]
    },
    tags: ['湖泊', '胡同', '酒吧', '老北京'],
    details: {
      openingHours: '全天开放',
      ticketInfo: '免费',
      activities: '游船、人力车、酒吧街'
    },
    reviews: []
  },

  // ==================== 美食类 ====================
  {
    category: 'food',
    name: '大董烤鸭店',
    description: '创新派烤鸭代表，以"酥不腻"烤鸭闻名，用新派手法演绎传统美食，环境优雅，是商务宴请的好选择。',
    images: [
      'https://images.unsplash.com/photo-1623653392124-ff4e645dce3c?w=800&q=80'
    ],
    price: 298,
    rating: 4.6,
    location: {
      city: '北京',
      address: '朝阳区团结湖北口3号楼',
      coordinates: [116.461, 39.933]
    },
    tags: ['烤鸭', '创新菜', '商务', '高端'],
    details: {
      openingHours: '11:00-14:30, 17:00-22:00',
      specialties: ['酥不腻烤鸭', '董氏烧海参', '黑松露酥'],
      averagePrice: '人均300-400元'
    },
    reviews: []
  },
  {
    category: 'food',
    name: '庆丰包子铺',
    description: '北京著名的包子连锁店，传统手工制作，馅料丰富，价格亲民，是体验北京早餐文化的好去处。',
    images: [
      'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80'
    ],
    price: 25,
    rating: 4.0,
    location: {
      city: '北京',
      address: '西城区西安门大街',
      coordinates: [116.387, 39.925]
    },
    tags: ['包子', '早餐', '传统', '连锁'],
    details: {
      openingHours: '6:00-21:00',
      specialties: ['猪肉大葱包', '三鲜包', '素三鲜包'],
      averagePrice: '人均20-30元'
    },
    reviews: []
  },
  {
    category: 'food',
    name: '四季民福烤鸭店',
    description: '性价比很高的烤鸭店，可以看到故宫角楼，环境优美，需要提前排队，深受游客喜爱。',
    images: [
      'https://images.unsplash.com/photo-1602273159530-73ba3b7eaa1b?w=800&q=80'
    ],
    price: 158,
    rating: 4.5,
    location: {
      city: '北京',
      address: '东城区东华门大街95号',
      coordinates: [116.402, 39.922]
    },
    tags: ['烤鸭', '景观餐厅', '排队', '网红'],
    details: {
      openingHours: '10:30-14:00, 16:30-21:00',
      specialties: ['烤鸭', '京味小吃', '老北京炸酱面'],
      averagePrice: '人均150-200元',
      tips: '建议提前1-2小时排队'
    },
    reviews: []
  },
  {
    category: 'food',
    name: '老舍茶馆',
    description: '集京味茶文化、戏曲表演、京味小吃于一体，可以一边品茶一边欣赏传统表演，体验老北京茶馆文化。',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'
    ],
    price: 180,
    rating: 4.2,
    location: {
      city: '北京',
      address: '西城区前门西大街正阳市场3号楼',
      coordinates: [116.395, 39.899]
    },
    tags: ['茶馆', '表演', '文化', '传统'],
    details: {
      openingHours: '10:00-22:00',
      specialties: ['大碗茶', '京味点心', '老北京小吃'],
      performances: '相声、京剧、杂技等',
      averagePrice: '人均150-250元（含表演）'
    },
    reviews: []
  },

  // ==================== 酒店类 ====================
  {
    category: 'hotel',
    name: '北京宝格丽酒店',
    description: '超豪华酒店，意大利风格设计，位于使馆区，设施奢华，服务顶级，是商务和度假的极致选择。',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
    ],
    price: 3800,
    rating: 4.9,
    location: {
      city: '北京',
      address: '朝阳区新源南路8号',
      coordinates: [116.462, 39.947]
    },
    tags: ['奢华', '五星级', '商务', 'SPA'],
    details: {
      checkIn: '15:00',
      checkOut: '12:00',
      facilities: ['米其林餐厅', 'SPA中心', '室内泳池', '健身中心', '会议室'],
      services: ['管家服务', '豪车接送', '私人定制'],
      roomTypes: ['豪华客房', '套房', '宝格丽别墅']
    },
    reviews: []
  },
  {
    category: 'hotel',
    name: '颐和安缦酒店',
    description: '位于颐和园东门，由明清皇家庭院改建，环境清幽，充满历史韵味，是体验皇家园林生活的绝佳选择。',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'
    ],
    price: 2800,
    rating: 4.8,
    location: {
      city: '北京',
      address: '海淀区宫门前街1号',
      coordinates: [116.278, 39.999]
    },
    tags: ['精品', '历史', '园林', '安静'],
    details: {
      checkIn: '14:00',
      checkOut: '12:00',
      facilities: ['中餐厅', 'SPA', '影院', '图书馆'],
      features: '明清建筑、私人庭院、近颐和园',
      roomTypes: ['庭院套房', '豪华套房']
    },
    reviews: []
  },
  {
    category: 'hotel',
    name: '汉庭酒店(王府井店)',
    description: '经济型连锁酒店，位置优越，距离王府井步行街仅5分钟，交通便利，适合预算有限的游客。',
    images: [
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800&q=80'
    ],
    price: 299,
    rating: 3.9,
    location: {
      city: '北京',
      address: '东城区东单北大街69号',
      coordinates: [116.410, 39.912]
    },
    tags: ['经济', '连锁', '便利', '实惠'],
    details: {
      checkIn: '14:00',
      checkOut: '12:00',
      facilities: ['免费WiFi', '24小时前台', '行李寄存', '洗衣服务'],
      roomTypes: ['标准间', '大床房', '家庭房']
    },
    reviews: []
  },
  {
    category: 'hotel',
    name: '北京瑰丽酒店',
    description: '现代奢华酒店，位于朝阳区CBD核心地段，拥有绝佳的城市景观，设计现代，是商务出行的理想选择。',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
    ],
    price: 2200,
    rating: 4.7,
    location: {
      city: '北京',
      address: '朝阳区呼家楼京广中心',
      coordinates: [116.461, 39.923]
    },
    tags: ['豪华', '商务', 'CBD', '现代'],
    details: {
      checkIn: '14:00',
      checkOut: '12:00',
      facilities: ['行政酒廊', '健身中心', '室内泳池', '多家餐厅'],
      view: '城市天际线景观',
      roomTypes: ['瑰丽客房', '行政客房', '瑰丽套房']
    },
    reviews: []
  }
];

// ========================================
// 执行添加操作
// ========================================
const addItems = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system');
    console.log('✅ 数据库连接成功');
    
    console.log(`\n准备添加 ${newItems.length} 个新项目...\n`);
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // 遍历并添加每个项目
    for (const itemData of newItems) {
      try {
        // 检查是否已存在同名项目
        const existingItem = await Item.findOne({ name: itemData.name });
        
        if (existingItem) {
          console.log(`⏭️  跳过已存在: ${itemData.name}`);
          skippedCount++;
          continue;
        }
        
        // 创建新项目
        const newItem = new Item(itemData);
        await newItem.save();
        
        console.log(`✅ 成功添加: ${itemData.name} [${itemData.category}] - ¥${itemData.price}`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ 添加失败 [${itemData.name}]:`, error);
        errorCount++;
      }
    }
    
    // 显示统计信息
    console.log('\n========================================');
    console.log('📊 添加完成统计：');
    console.log(`   ✅ 成功添加: ${addedCount} 个`);
    console.log(`   ⏭️  跳过重复: ${skippedCount} 个`);
    console.log(`   ❌ 添加失败: ${errorCount} 个`);
    
    // 显示数据库总数
    const totalItems = await Item.countDocuments();
    const categoryCount = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 数据库统计：');
    console.log(`   总计: ${totalItems} 个项目`);
    categoryCount.forEach(cat => {
      const categoryName = cat._id === 'attraction' ? '景点' : 
                          cat._id === 'food' ? '美食' : '酒店';
      console.log(`   - ${categoryName}: ${cat.count} 个`);
    });
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库操作失败:', error);
    process.exit(1);
  }
};

// 执行脚本
addItems();