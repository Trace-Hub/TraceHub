import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)

// 서버/클라이언트 런타임의 로컬 타임존과 어긋나지 않도록
// 앱 전체에서 이 래퍼를 통해 dayjs를 사용한다
export default dayjs
