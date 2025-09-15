import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item';
import User from '../models/User';

dotenv.config();

const seedData = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system');
    console.log('✅ 数据库连接成功');

    // 清空现有数据

    console.log('📝 已清空现有数据');

    // 创建测试项目数据
    const items = [
      // 景点
      {
        category: 'attraction',
        name: '故宫博物院',
        description: '故宫博物院是中国明清两代的皇家宫殿，旧称紫禁城，位于北京中轴线的中心。是世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
        images: ['https://via.placeholder.com/400x300?text=故宫博物院'],
        price: 60,
        rating: 4.8,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '东城区景山前街4号',
          coordinates: [116.397, 39.917]
        },
        tags: ['历史', '文化', '建筑', '世界遗产'],
        details: {
          openingHours: '旺季 8:30-17:00，淡季 8:30-16:30',
          ticketInfo: '成人票60元，学生票20元',
          bestSeason: '春秋季节'
        },
        reviews: [
          {
            reviewId: new mongoose.Types.ObjectId(),
            userId: 'user1',
            userName: '张三',
            rating: 5,
            comment: '非常壮观，值得一游！建议提前网上购票。',
            date: new Date()
          }
        ]
      },
      {
        category: 'attraction',
        name: '长城-八达岭',
        description: '八达岭长城是明长城的一个隘口，是居庸关的重要前哨，古称"居庸之险不在关而在八达岭"。',
        images: ['https://via.placeholder.com/400x300?text=八达岭长城'],
        price: 40,
        rating: 4.7,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '延庆区G6京藏高速58号出口',
          coordinates: [116.016, 40.356]
        },
        tags: ['历史', '文化', '世界遗产', '户外'],
        details: {
          openingHours: '夏季 6:30-19:00，冬季 7:00-18:00',
          ticketInfo: '旺季40元，淡季35元',
          difficulty: '中等'
        },
        reviews: []
      },
      {
        category: 'attraction',
        name: '颐和园',
        description: '颐和园是中国清朝时期皇家园林，前身为清漪园，是以昆明湖、万寿山为基址的大型山水园林。',
        images: ['https://via.placeholder.com/400x300?text=颐和园'],
        price: 30,
        rating: 4.6,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '海淀区新建宫门路19号',
          coordinates: [116.272, 39.999]
        },
        tags: ['园林', '文化', '世界遗产', '皇家'],
        details: {
          openingHours: '旺季 6:30-18:00，淡季 7:00-17:00',
          area: '290公顷',
          highlights: '佛香阁、长廊、十七孔桥'
        },
        reviews: []
      },
      {
        category: 'attraction',
        name: '天坛公园',
        description: '天坛是明清两代皇帝祭天、祈谷的场所，是中国现存最大的古代祭祀建筑群。',
        images: ['https://via.placeholder.com/400x300?text=天坛'],
        price: 15,
        rating: 4.5,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '东城区天坛东里甲1号',
          coordinates: [116.410, 39.882]
        },
        tags: ['历史', '文化', '世界遗产', '建筑'],
        details: {
          openingHours: '6:00-22:00',
          mainAttractions: '祈年殿、皇穹宇、圜丘坛',
          area: '273公顷'
        },
        reviews: []
      },

      // 美食
      {
        category: 'food',
        name: '全聚德烤鸭店',
        description: '全聚德始建于1864年，是北京著名的老字号，以经营挂炉烤鸭而闻名。其烤鸭皮酥肉嫩，是北京的代表美食。',
        images: ['https://via.placeholder.com/400x300?text=全聚德烤鸭'],
        price: 268,
        rating: 4.5,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '前门大街30号',
          coordinates: [116.398, 39.899]
        },
        tags: ['烤鸭', '老字号', '传统美食', '商务宴请'],
        details: {
          openingHours: '11:00-14:00, 17:00-21:00',
          specialties: ['挂炉烤鸭', '鸭架汤', '鸭肝'],
          averagePrice: '人均200-300元'
        },
        reviews: [
          {
            reviewId: new mongoose.Types.ObjectId(),
            userId: 'user2',
            userName: '李四',
            rating: 4,
            comment: '烤鸭很正宗，就是价格有点贵。服务很好。',
            date: new Date()
          }
        ]
      },
      {
        category: 'food',
        name: '东来顺涮羊肉',
        description: '东来顺创建于1903年，是京城老字号清真饭庄。以传统的炭火铜锅涮羊肉闻名，选料精良，刀工精湛。',
        images: ['https://via.placeholder.com/400x300?text=东来顺涮羊肉'],
        price: 128,
        rating: 4.4,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '王府井大街198号',
          coordinates: [116.410, 39.914]
        },
        tags: ['火锅', '涮羊肉', '老字号', '清真'],
        details: {
          openingHours: '11:00-22:00',
          specialties: ['手切羊肉', '烧饼', '糖蒜'],
          averagePrice: '人均100-150元'
        },
        reviews: []
      },
      {
        category: 'food',
        name: '姚记炒肝店',
        description: '老北京传统小吃店，主营炒肝、包子等北京特色早点。炒肝汤汁透亮，肝香肠肥，是地道的北京味道。',
        images: ['https://via.placeholder.com/400x300?text=姚记炒肝'],
        price: 28,
        rating: 4.3,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '鼓楼东大街311号',
          coordinates: [116.396, 39.948]
        },
        tags: ['小吃', '早餐', '传统', '炒肝'],
        details: {
          openingHours: '6:00-20:00',
          specialties: ['炒肝', '包子', '卤煮'],
          averagePrice: '人均20-40元'
        },
        reviews: []
      },

      // 酒店
      {
        category: 'hotel',
        name: '北京王府井希尔顿酒店',
        description: '位于王府井商业区中心，距离故宫、天安门广场仅几步之遥。酒店设施齐全，服务一流。',
        images: ['https://via.placeholder.com/400x300?text=希尔顿酒店'],
        price: 880,
        rating: 4.6,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '王府井东街8号',
          coordinates: [116.411, 39.913]
        },
        tags: ['豪华', '商务', '市中心', '五星级'],
        details: {
          checkIn: '14:00',
          checkOut: '12:00',
          facilities: ['健身房', '游泳池', '商务中心', 'SPA'],
          roomTypes: ['标准间', '豪华套房', '行政套房']
        },
        reviews: []
      },
      {
        category: 'hotel',
        name: '北京四季酒店',
        description: '坐落于北京市中心，紧邻使馆区和CBD商圈。酒店融合了现代奢华与传统中式元素。',
        images: ['https://via.placeholder.com/400x300?text=四季酒店'],
        price: 1280,
        rating: 4.8,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '朝阳区亮马桥路48号',
          coordinates: [116.462, 39.949]
        },
        tags: ['奢华', '商务', 'SPA', '五星级'],
        details: {
          checkIn: '15:00',
          checkOut: '12:00',
          facilities: ['米其林餐厅', '室内泳池', 'SPA中心', '健身中心'],
          services: ['管家服务', '机场接送', '商务服务']
        },
        reviews: []
      },
      {
        category: 'hotel',
        name: '如家快捷酒店(天安门店)',
        description: '经济型连锁酒店，位置便利，距离天安门、前门大街步行可达。干净舒适，性价比高。',
        images: ['https://via.placeholder.com/400x300?text=如家酒店'],
        price: 239,
        rating: 4.0,
        purchaseCount: 0,
        location: {
          city: '北京',
          address: '前门东大街2号',
          coordinates: [116.398, 39.901]
        },
        tags: ['经济', '连锁', '便捷', '市中心'],
        details: {
          checkIn: '14:00',
          checkOut: '12:00',
          facilities: ['免费WiFi', '24小时前台', '行李寄存'],
          roomTypes: ['标准间', '大床房']
        },
        reviews: []
      }
    ];

    const savedItems = await Item.insertMany(items);
    console.log(`✅ 成功创建 ${savedItems.length} 个项目`);

    // 创建测试用户
    const users = [
      {
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo123',
        preferences: {
          categories: ['attraction', 'food'],
          tags: ['历史', '文化', '美食'],
          priceRange: [0, 500]
        }
      },
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123',
        preferences: {
          categories: ['hotel', 'food'],
          tags: ['豪华', '商务', '烤鸭'],
          priceRange: [200, 1500]
        }
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        preferences: {
          categories: ['attraction'],
          tags: ['历史', '世界遗产'],
          priceRange: [0, 100]
        }
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ 创建用户: ${user.username}`);
    }

    console.log('\n========================================');
    console.log('✅ 数据初始化完成！');
    console.log('========================================');
    console.log('\n📝 测试账号：');
    console.log('用户名: demo');
    console.log('密码: demo123');
    console.log('\n其他测试账号：');
    console.log('用户名: testuser1, 密码: password123');
    console.log('用户名: testuser2, 密码: password123');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
    process.exit(1);
  }
};

// 执行数据初始化
seedData();