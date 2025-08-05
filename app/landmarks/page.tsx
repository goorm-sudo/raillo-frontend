"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Map } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import { StationSelector } from "@/components/ui/station-selector"

// Kakao Maps 타입 선언
declare global {
  interface Window {
    kakao: any
    currentMarkers: any[]
    closeOverlay: () => void
    allOverlays: any[]
  }
}

// 카테고리 정의
const CATEGORIES = [
  { id: "AT4", name: "관광명소" },
  { id: "CT1", name: "문화시설" },
  { id: "FD6", name: "음식점" },
  { id: "CS2", name: "편의점" },
  { id: "CE7", name: "카페" },
  { id: "AD5", name: "숙박" }
] as const

// 오버레이 설정
const OVERLAY_CONFIG = {
  yAnchor: 1.3,
  width: 280,
  borderRadius: 12
}

export default function LandmarksPage() {
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("AT4")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentOverlay, setCurrentOverlay] = useState<any>(null)

  // 커스텀 오버레이 닫기 함수
  const closeOverlay = () => {
    if (currentOverlay) {
      currentOverlay.setMap(null)
      setCurrentOverlay(null)
    }
  }

  // 모든 오버레이 닫기 함수
  const closeAllOverlays = () => {
    if (typeof window !== 'undefined') {
      if (!window.allOverlays) {
        window.allOverlays = []
      }
      
      window.allOverlays.forEach((overlay: any) => {
        if (overlay && overlay.setMap) {
          overlay.setMap(null)
        }
      })
      window.allOverlays = []
    }
    
    if (currentOverlay) {
      currentOverlay.setMap(null)
      setCurrentOverlay(null)
    }
  }

  // 역 좌표 찾기 함수
  const findStationCoordinates = async (stationName: string): Promise<{lat: number, lng: number, name: string} | null> => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      return null
    }

    const ps = new window.kakao.maps.services.Places()
    
    return new Promise((resolve) => {
      // KTX 역명으로 검색
      ps.keywordSearch(`KTX ${stationName}`, (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
          const station = data[0]
          resolve({
            lat: parseFloat(station.y),
            lng: parseFloat(station.x),
            name: station.place_name
          })
        } else {
          // KTX 검색이 실패하면 역명만으로 검색
          ps.keywordSearch(stationName, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
              const station = data[0]
              resolve({
                lat: parseFloat(station.y),
                lng: parseFloat(station.x),
                name: station.place_name
              })
            } else {
              resolve(null)
            }
          })
        }
      })
    })
  }

  // 오버레이 HTML 컨텐츠 생성 함수
  const createOverlayContent = (place: any) => {
    return `
      <div class="wrap" style="position:relative;width:${OVERLAY_CONFIG.width}px;background:#fff;border-radius:${OVERLAY_CONFIG.borderRadius}px;box-shadow:0 4px 20px rgba(0,0,0,0.15);overflow:visible;">
        <!-- 연결선 -->
        <div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #fff;"></div>
        
        <div class="header" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:12px 16px;color:white;border-radius:${OVERLAY_CONFIG.borderRadius}px ${OVERLAY_CONFIG.borderRadius}px 0 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3 style="font-size:14px;font-weight:600;margin:0;line-height:1.3;">${place.place_name}</h3>
            <div class="close" onclick="window.closeOverlay()" style="width:18px;height:18px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;font-weight:bold;color:white;transition:background 0.2s;" title="닫기" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</div>
          </div>
        </div>
        <div class="body" style="padding:16px;border-radius:0 0 ${OVERLAY_CONFIG.borderRadius}px ${OVERLAY_CONFIG.borderRadius}px;">
          <div class="info-item" style="margin-bottom:8px;display:flex;align-items:flex-start;">
            <span style="color:#667eea;font-size:12px;margin-right:6px;margin-top:1px;">📍</span>
            <span style="color:#555;font-size:12px;line-height:1.4;">${place.address_name}</span>
          </div>
          ${place.phone ? `
          <div class="info-item" style="margin-bottom:8px;display:flex;align-items:center;">
            <span style="color:#667eea;font-size:12px;margin-right:6px;">📞</span>
            <span style="color:#555;font-size:12px;">${place.phone}</span>
          </div>
          ` : ''}
          <div class="info-item" style="margin-bottom:12px;display:flex;align-items:center;">
            <span style="color:#667eea;font-size:12px;margin-right:6px;">🏷️</span>
            <span style="color:#777;font-size:11px;">${place.category_name.split(' > ').pop()}</span>
          </div>
          ${place.place_url ? `
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #eee;">
            <a href="${place.place_url}" target="_blank" style="color:#667eea;text-decoration:none;font-size:12px;font-weight:500;display:flex;align-items:center;">
              <span style="margin-right:4px;">🗺️</span>
              카카오맵에서 보기
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `
  }

  // 커스텀 오버레이 생성 및 표시 함수
  const createAndShowOverlay = (place: any, position: any) => {
    const content = createOverlayContent(place)
    
    const overlay = new window.kakao.maps.CustomOverlay({
      content: content,
      position: position,
      xAnchor: 0.5,
      yAnchor: OVERLAY_CONFIG.yAnchor
    })

    overlay.setMap(map)
    setCurrentOverlay(overlay)
    
    // 전역 배열에 추가
    if (typeof window !== 'undefined') {
      if (!window.allOverlays) {
        window.allOverlays = []
      }
      window.allOverlays.push(overlay)
    }
  }

  // 특정 장소로 이동하고 커스텀 오버레이 표시
  const showPlaceInfo = (place: any) => {
    if (!map) return

    closeAllOverlays()

    const position = new window.kakao.maps.LatLng(place.y, place.x)
    map.setCenter(position)
    map.setLevel(3)

    createAndShowOverlay(place, position)
  }

  // 전역 함수로 등록 (HTML에서 onclick으로 호출하기 위해)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.closeOverlay = closeOverlay
    }
  }, [currentOverlay])

  // 카카오 지도 API 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      if (typeof window !== 'undefined' && !mapLoaded) {
        const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_API_KEY
        
        if (!apiKey || apiKey === '발급받은_APP_KEY를_사용하세요') {
          console.error('카카오 지도 API 키가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_KAKAO_MAPS_API_KEY를 설정해주세요.')
          return
        }
        
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
        script.async = true
        
        script.onload = () => {
          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              setMapLoaded(true)
              initializeMap()
            })
          }
        }
        
        document.head.appendChild(script)
      }
    }

    loadKakaoMap()
  }, [mapLoaded])

  // 지도 초기화
  const initializeMap = () => {
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      const mapContainer = document.getElementById('kakao-map')
      
      if (mapContainer) {
        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
          level: 7
        }
        
        const newMap = new window.kakao.maps.Map(mapContainer, mapOption)
        
        // 지도 타입 컨트롤 추가 (일반 지도와 스카이뷰 전환)
        const mapTypeControl = new window.kakao.maps.MapTypeControl()
        newMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)
        
        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl()
        newMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)
        
        setMap(newMap)
      }
    }
  }

  // 선택된 역으로 지도 중심 이동 및 마커 생성
  useEffect(() => {
    if (map && selectedStation) {
      closeAllOverlays()
      
      // 기존 마커들 제거
      if (window.currentMarkers) {
        window.currentMarkers.forEach(marker => marker.setMap(null))
      }
      window.currentMarkers = []
      
      // 역 좌표 찾기 및 카테고리 검색
      const searchNearStation = async () => {
        const stationCoords = await findStationCoordinates(selectedStation)
        
        if (stationCoords && stationCoords.lat && stationCoords.lng) {
          // 역 위치로 지도 이동
          const stationPosition = new window.kakao.maps.LatLng(stationCoords.lat, stationCoords.lng)
          map.setCenter(stationPosition)
          map.setLevel(5)
          
          // 카테고리 검색
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const ps = new window.kakao.maps.services.Places(map)
            
            ps.categorySearch(selectedCategory, (data: any, status: any, pagination: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data)
                
                // 검색된 장소들을 마커로 표시
                data.forEach((place: any) => {
                  const marker = new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(place.y, place.x)
                  })
                  
                  // 마커 클릭 이벤트
                  window.kakao.maps.event.addListener(marker, 'click', function() {
                    closeAllOverlays()
                    createAndShowOverlay(place, marker.getPosition())
                  })
                  
                  marker.setMap(map)
                  window.currentMarkers.push(marker)
                })
              } else {
                setSearchResults([])
              }
            }, { useMapBounds: true })
          }
        }
      }
      
      searchNearStation()
    }
  }, [map, selectedStation, selectedCategory])

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              역 근처
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                랜드마크 찾기
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              역을 선택하면 주변의 관광지, 문화재, 맛집 등을 찾아드립니다
            </p>
          </div>

          {/* Controls Panel */}
          <Card className="mb-8 bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Station Selector */}
                <div className="md:col-span-2">
                  <StationSelector
                    value={selectedStation}
                    onValueChange={(value) => {
                      setSelectedStation(value)
                    }}
                    placeholder="역을 선택하세요"
                    label="역 선택"
                    hideHistory={true}
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Map View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-[600px] relative">
                    <div id="kakao-map" className="w-full h-full"></div>
                    {!mapLoaded && (
                      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg animate-pulse">
                            <Map className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">카카오 지도 로딩 중...</h3>
                          <p className="text-gray-600">지도를 불러오는 중입니다</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-lg border-0 h-[600px]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {selectedStation ? `${selectedStation} 주변 랜드마크` : '랜드마크 목록'}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {searchResults.length > 0 ? `${searchResults.length}개의 결과` : '검색된 장소들이 여기에 표시됩니다'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto h-[calc(600px-120px)]">
                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((place) => (
                        <div 
                          key={place.id} 
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                          onClick={() => showPlaceInfo(place)}
                        >
                          <div className="mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm">{place.place_name}</h3>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{place.address_name}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-blue-500" />
                              <span>{place.category_name.split(' > ').pop()}</span>
                            </div>
                            {place.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-blue-500" />
                                <span>{place.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">
                        {selectedStation ? '지도에서 검색된 장소들을 확인하세요' : '역을 선택해주세요'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
} 