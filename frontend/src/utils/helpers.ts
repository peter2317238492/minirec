// frontend/src/utils/helpers.ts
export const formatPurchaseCount = (count: number = 0): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万+`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k+`;
  }
  return count.toString();
};

export const categoryColors = {
  attraction: 'bg-blue-100 text-blue-800',
  food: 'bg-green-100 text-green-800',
  hotel: 'bg-purple-100 text-purple-800'
};

export const categoryLabels = {
  attraction: '景点',
  food: '美食',
  hotel: '酒店'
};