function formatTimeTicks(uptime: number) {
  const numberUptime = Number(uptime)
  const hours: number = Math.floor(numberUptime / 360000)
  const minutes: number = Math.floor((numberUptime % 360000) / 6000)
  const seconds: number = numberUptime % 60
  return [hours, minutes, seconds]
}

const buildingNameENGtoCHN: Record<string, string> = {
  tower: '塔楼',
  administrativeBuilding: '行政楼',
  dormitory: '宿舍楼',
  plant: '厂房',
  lowRiseBuilding: '矮楼',
  officeBuilding: '办公楼',
  ringBuilding: '环楼',
  informationCenter: '信息中心',
  theSideTower: '边楼',
  bungalow1: '平房1',
  bungalow2: '平房2',
  bungalow3: '平房3',
  bungalow4: '平房4',
  warehouse1: '仓库1',
  warehouse2: '仓库2',
  warehouse3: '仓库3',
  warehouse4: '仓库4',
}

export { formatTimeTicks, buildingNameENGtoCHN }
