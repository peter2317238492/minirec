import { Item } from '../types';
declare const BMap: any;
declare const BMapLib: any;
// 用户位置状态
let userLocation: { latitude: number; longitude: number } | null = null;

// 获取用户定位
export const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLocation = { latitude, longitude };
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分钟
        }
      );
    } else {
      reject(new Error('浏览器不支持地理定位'));
    }
  });
};

// 计算两点之间的直线距离（使用百度地图API）
export const calculateDistance = (
  item: Item
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!userLocation) {
      reject(new Error('用户位置信息不可用'));
      return;
    }

    if (!item.location.coordinates || item.location.coordinates.length < 2) {
      reject(new Error('项目缺少坐标信息'));
      return;
    }

    // 检查百度地图API是否可用
    if (typeof BMap !== 'undefined') {
      try {
        // 创建用户位置点
        const userPoint = new BMap.Point(userLocation.longitude, userLocation.latitude);
        // 创建项目位置点
        const itemPoint = new BMap.Point(item.location.coordinates[0], item.location.coordinates[1]);
        
        // 计算距离（米）
        const distance = BMapLib.GeoUtils.getDistance(userPoint, itemPoint);
        resolve(distance);
      } catch (error) {
        reject(error);
      }
    } else {
      // 如果百度地图API不可用，使用Haversine公式计算近似距离
      const distance = calculateHaversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.location.coordinates[1],
        item.location.coordinates[0]
      );
      resolve(distance);
    }
  });
};

// 获取交通路线和时间信息
export const getTransportInfo = (
  item: Item
): Promise<{ mode: string; duration: string; distance: string }> => {
  return new Promise((resolve, reject) => {
    if (!userLocation) {
      reject(new Error('用户位置信息不可用'));
      return;
    }

    if (!item.location.coordinates || item.location.coordinates.length < 2) {
      reject(new Error('项目缺少坐标信息'));
      return;
    }

    // 检查百度地图API是否可用
    if (typeof BMap !== 'undefined') {
      try {
        // 创建用户位置点
        const userPoint = new BMap.Point(userLocation.longitude, userLocation.latitude);
        // 创建项目位置点
        const itemPoint = new BMap.Point(item.location.coordinates[0], item.location.coordinates[1]);
        
        // 创建驾车路线规划实例
        const driving = new BMap.DrivingRoute(userPoint, {
          onSearchComplete: (results: any) => {
            if (driving.getStatus() === BMap.STATUS_SUCCESS) {
              const plan = results.getPlan(0);
              const distance = plan.getDistance(true); // 获取距离
              const duration = plan.getDuration(true); // 获取时间
              
              resolve({
                mode: '驾车',
                duration: duration,
                distance: distance
              });
            } else {
              // 如果驾车路线规划失败，尝试步行
              const walking = new BMap.WalkingRoute(userPoint, {
                onSearchComplete: (walkResults: any) => {
                  if (walking.getStatus() === BMap.STATUS_SUCCESS) {
                    const walkPlan = walkResults.getPlan(0);
                    const walkDistance = walkPlan.getDistance(true);
                    const walkDuration = walkPlan.getDuration(true);
                    
                    resolve({
                      mode: '步行',
                      duration: walkDuration,
                      distance: walkDistance
                    });
                  } else {
                    reject(new Error('无法获取路线信息'));
                  }
                }
              });
              walking.search(itemPoint);
            }
          }
        });
        driving.search(itemPoint);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error('百度地图API不可用'));
    }
  });
};

// 生成百度地图导航链接
export const generateBaiduMapLink = (
  item: Item
): string => {
  if (!userLocation) {
    return `https://map.baidu.com/search/${encodeURIComponent(item.location.address)}`;
  }

  if (!item.location.coordinates || item.location.coordinates.length < 2) {
    return `https://map.baidu.com/search/${encodeURIComponent(item.location.address)}`;
  }

  const origin = `${userLocation.latitude},${userLocation.longitude}`;
  const destination = `${item.location.coordinates[1]},${item.location.coordinates[0]}`;
  const destinationName = encodeURIComponent(item.name);
  
  return `https://map.baidu.com/direction?origin=${origin}&destination=${destination}&mode=driving&region=中国&output=html&destination_name=${destinationName}`;
};

// Haversine公式计算两点间距离（备用方案）
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// 格式化距离显示
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

// 获取用户位置状态
export const getUserLocationStatus = (): { latitude: number; longitude: number } | null => {
  return userLocation;
};

// 清除用户位置
export const clearUserLocation = (): void => {
  userLocation = null;
};