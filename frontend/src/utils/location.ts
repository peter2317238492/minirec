import { Item } from '../types';

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
    if (typeof (window as any).BMap !== 'undefined' && typeof (window as any).BMapLib !== 'undefined') {
      try {
      // 创建用户位置点
      const userPoint = new (window as any).BMap.Point(userLocation.longitude, userLocation.latitude);
      // 创建项目位置点
      const itemPoint = new (window as any).BMap.Point(item.location.coordinates[0], item.location.coordinates[1]);
      
      // 计算距离（米）
      const distance = (window as any).BMapLib.GeoUtils.getDistance(userPoint, itemPoint);
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