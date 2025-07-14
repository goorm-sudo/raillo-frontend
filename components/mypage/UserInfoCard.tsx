import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Train, Star } from "lucide-react"

interface UserInfoCardProps {
  loginInfo: any;
  isLoggedIn: boolean;
  currentMileage?: number;
  membershipNumber?: string;
  detailed?: boolean;
  earningSchedules?: any[];
  delayCompensation?: any[];
  loading?: boolean;
  isInitialLoading?: boolean;
}

export default function UserInfoCard({ 
  loginInfo, 
  isLoggedIn, 
  currentMileage = 0,
  membershipNumber,
  detailed = false,
  earningSchedules = [],
  delayCompensation = [],
  loading = false,
  isInitialLoading = false
}: UserInfoCardProps) {
  // 초기 로딩 시 스켈레톤 UI 표시
  if (isInitialLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-5 w-24" />
          {membershipNumber !== undefined && (
            <Skeleton className="h-4 w-36 mt-1" />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline" className="text-xs">
            비즈니스
          </Badge>
        </div>
        <h3 className="font-bold text-lg">
          {isLoggedIn && loginInfo ? `${loginInfo.username} 회원님` : '게스트 님'}
        </h3>
        
        {/* 기본적으로 간단한 버전만 표시 */}
        <p className="text-sm text-gray-600">
          마일리지: {currentMileage?.toLocaleString() || '0'}P
        </p>
        {membershipNumber && (
          <p className="text-sm text-gray-600 mt-1">
            멤버십 번호: {membershipNumber}
          </p>
        )}
        
        {detailed && (
          // 상세 버전 (메인 마이페이지용)
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">보유 마일리지</span>
              <span className="text-lg font-bold text-blue-600">{currentMileage?.toLocaleString() || '0'}P</span>
            </div>
            
            {/* 적립 예정 마일리지 */}
            {isLoggedIn && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">적립 예정</span>
                  {loading && <span className="text-xs text-gray-500">로딩중...</span>}
                </div>
                
                <div className="space-y-1 text-xs text-green-700">
                  {/* 기본 적립 예정 */}
                  {earningSchedules.length > 0 ? (
                    earningSchedules.slice(0, 3).map((schedule, index) => (
                      <div key={index} className="flex justify-between">
                        <span>• {schedule.earningType || '기본 적립'} ({schedule.trainNumber || 'KTX'})</span>
                        <span className="font-medium">+{(schedule.earningAmount || 0).toLocaleString()}P</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between">
                      <span>• 기본 적립 (1%)</span>
                      <span className="font-medium">+0P</span>
                    </div>
                  )}
                  
                  {/* 지연 보상 대기 */}
                  {delayCompensation.length > 0 ? (
                    delayCompensation.slice(0, 2).map((compensation, index) => (
                      <div key={index} className="flex justify-between">
                        <span>• 지연 보상 ({compensation.trainNumber || 'KTX'})</span>
                        <span className="font-medium">+{(compensation.compensationAmount || 0).toLocaleString()}P</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between">
                      <span>• 지연 보상 대기</span>
                      <span className="font-medium">+0P</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-1 font-medium">
                    <span>합계</span>
                    <span className="text-green-600">
                      +{(
                        (earningSchedules.reduce((sum, s) => sum + (s.earningAmount || 0), 0)) +
                        (delayCompensation.reduce((sum, c) => sum + (c.compensationAmount || 0), 0))
                      ).toLocaleString()}P
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-green-600 mt-2">
                  💡 도착 시간 이후 자동 적립
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}