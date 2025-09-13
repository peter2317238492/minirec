import { Item } from '../types';
// 百度地图API类型声明
declare namespace BMap {
  interface Point {
    lng: number;
    lat: number;
  }
  
  class Geocoder {
    getPoint(address: string, callback: (point: Point) => void, city?: string): void;
  }
  
  class Point {
    constructor(lng: number, lat: number);
  }
  
  class DrivingRoute {
    constructor(start: Point, options: {
      onSearchComplete: (results: any) => void;
    });
    getStatus(): number;
    search(end: Point): void;
  }
  
  class WalkingRoute {
    constructor(start: Point, options: {
      onSearchComplete: (results: any) => void;
    });
    getStatus(): number;
    search(end: Point): void;
  }
}
declare const BMapLib: any;

// 百度地图API状态码
declare const BMAP_STATUS_SUCCESS: number;

// 定义状态码常量
const BMAP_STATUS_SUCCESS_VALUE = 0;
// 用户位置状态
let userLocation: { latitude: number; longitude: number; address?: string } | null = null;

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

// 计算两点之间的直线距离（使用Haversine公式）
export const calculateDistance = (
  item: Item
): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    if (!userLocation) {
      reject(new Error('用户位置信息不可用'));
      return;
    }

    try {
      let userLat = userLocation.latitude;
      let userLon = userLocation.longitude;
      let itemLat: number | undefined;
      let itemLon: number | undefined;

      // 如果用户位置有坐标，直接使用
      if (!userLat || !userLon) {
        // 如果没有坐标，尝试通过地址获取坐标
        if (userLocation.address && typeof BMap !== 'undefined') {
          const userPoint = await getPointFromAddress(userLocation.address);
          if (userPoint) {
            userLat = userPoint.lat;
            userLon = userPoint.lng;
          }
        }
      }

      // 获取目标位置的坐标
      if (item.location.coordinates && item.location.coordinates.length >= 2) {
        // 如果有坐标数据，直接使用
        itemLat = item.location.coordinates[1]; // 纬度
        itemLon = item.location.coordinates[0]; // 经度
      } else if (typeof BMap !== 'undefined') {
        // 如果没有坐标数据，通过地址获取坐标
        const itemAddress = item.location.address || item.name;
        const itemPoint = await getPointFromAddress(itemAddress, item.location.city);
        if (itemPoint) {
          itemLat = itemPoint.lat;
          itemLon = itemPoint.lng;
        }
      }

      // 检查是否获取到了有效的坐标
      if (!userLat || !userLon || !itemLat || !itemLon) {
        reject(new Error('无法获取有效的坐标信息'));
        return;
      }

      // 使用Haversine公式计算距离
      const distance = calculateHaversineDistance(userLat, userLon, itemLat, itemLon);
      resolve(distance);
    } catch (error) {
      reject(error);
    }
  });
};

// 通过地址获取坐标点的辅助函数
const getPointFromAddress = (address: string, city?: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve, reject) => {
    if (typeof BMap === 'undefined') {
      resolve(null);
      return;
    }

    try {
      const geoCoder = new BMap.Geocoder();
      geoCoder.getPoint(address, (point: any) => {
        if (point) {
          resolve({ lat: point.lat, lng: point.lng });
        } else {
          resolve(null);
        }
      }, city);
    } catch (error) {
      reject(error);
    }
  });
};

// 获取交通路线和时间信息
export const getTransportInfo = (
  item: Item
): Promise<{ mode: string; duration: string; distance: string }> => {
  if (userLocation) {
    console.log('userLocation:', userLocation.address || `${userLocation.latitude},${userLocation.longitude}`);
  } else {
    console.log('userLocation: 用户位置信息不可用');
  }
  
  const itemAddress = item.location.address || item.name;
  console.log('itemAddress:', itemAddress);
  
  return new Promise((resolve, reject) => {
    if (!userLocation) {
      reject(new Error('用户位置信息不可用'));
      return;
    }

    // 检查百度地图API是否可用
    if (typeof BMap !== 'undefined') {
      try {
        // 创建地理编码实例
        const geoCoder = new BMap.Geocoder();
        
        // 获取用户位置的坐标（通过地址）
        const getUserPoint = (): Promise<BMap.Point> => {
          return new Promise((resolveUser, rejectUser) => {
            if (userLocation!.latitude && userLocation!.longitude) {
              // 如果有坐标，直接使用 [经度, 纬度]
              resolveUser(new BMap.Point(userLocation!.longitude, userLocation!.latitude));
            } else if (userLocation!.address) {
              // 如果有地址，通过地理编码获取坐标
              geoCoder.getPoint(userLocation!.address, (point: BMap.Point) => {
                if (point) {
                  resolveUser(point);
                } else {
                  rejectUser(new Error('无法解析用户地址'));
                }
              });
            } else {
              rejectUser(new Error('用户位置信息不完整'));
            }
          });
        };
        
        // 获取目标位置的坐标（通过地址）
        const getItemPoint = (): Promise<BMap.Point> => {
          return new Promise((resolveItem, rejectItem) => {
            if (item.location.coordinates && item.location.coordinates.length >= 2) {
              // 如果有坐标数据，直接使用 [经度, 纬度]
              resolveItem(new BMap.Point(item.location.coordinates[0], item.location.coordinates[1]));
            } else {
              // 如果没有坐标数据，通过地址获取坐标
              const itemAddress = item.location.address || item.name;
              geoCoder.getPoint(itemAddress, (point: BMap.Point) => {
                if (point) {
                  resolveItem(point);
                } else {
                  rejectItem(new Error('无法解析目标地址'));
                }
              }, item.location.city);
            }
          });
        };
        
        // 并行获取两个位置的坐标
        Promise.all([getUserPoint(), getItemPoint()])
          .then(([userPoint, itemPoint]) => {
            console.log('用户坐标点:', userPoint);
            console.log('目标坐标点:', itemPoint);
            
            // 创建驾车路线规划实例
            const driving = new BMap.DrivingRoute(userPoint, {
              onSearchComplete: (results: any) => {
                console.log('驾车路线规划状态:', driving.getStatus());
                if (driving.getStatus() === BMAP_STATUS_SUCCESS_VALUE) {
                  const plan = results.getPlan(0);
                  const distance = plan.getDistance(true); // 获取距离
                  const duration = plan.getDuration(true); // 获取时间
                  
                  resolve({
                    mode: '驾车',
                    duration: duration,
                    distance: distance
                  });
                } else {
                  console.log('驾车路线规划失败，尝试步行');
                  // 如果驾车路线规划失败，尝试步行
                  const walking = new BMap.WalkingRoute(userPoint, {
                    onSearchComplete: (walkResults: any) => {
                      console.log('步行路线规划状态:', walking.getStatus());
                      if (walking.getStatus() === BMAP_STATUS_SUCCESS_VALUE) {
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
          })
          .catch((error) => {
            console.error('获取坐标点失败:', error);
            reject(error);
          });
      } catch (error) {
        console.error('交通信息获取失败:', error);
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
    return `https://map.baidu.com/search/${encodeURIComponent(item.location.address || item.name)}`;
  }

  // 获取起点地址
  const originAddress = userLocation.address || `${userLocation.latitude},${userLocation.longitude}`;
  // 获取终点地址
  const destinationAddress = item.location.address || item.name;
  const destinationName = encodeURIComponent(item.name);
  
  // 使用地址名称而非坐标生成导航链接
  return `https://map.baidu.com/direction?origin=${encodeURIComponent(originAddress)}&destination=${encodeURIComponent(destinationAddress)}&mode=driving&region=中国&output=html&destination_name=${destinationName}`;
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