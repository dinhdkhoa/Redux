import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/fetchBaseQuery'

/**
 * Kiểu ErrorFormObject dành cho trường hợp bao quát
 */

interface ErrorFormObject {
  [key: string | number]: string | ErrorFormObject | ErrorFormObject[]
}

interface EntityError {
  status: 422
  data: {
    error: ErrorFormObject
  }
}

/**
 * Phương pháp "type predicate" dùng để thu hẹp kiểu của một biến
 * ✅ Đầu tiên chúng ta sẽ khai báo một function check kiểm tra cấu trúc về mặc logic javascript
 * ✅ Tiếp theo chúng ta thêm `parameterName is Type` làm kiểu return của function thay vì boolean
 * ✅ Khi dùng function kiểu tra kiểu này, ngoài việc kiểm tra về mặc logic cấu trúc, nó còn chuyển kiểu
 *
 * So sánh với phương pháp ép kiểu "Type Assertions" thì ép kiểu chúng giúp chúng ta đúng về mặc Type, chưa chắc về logic
 *
 */

/**
 * Thu hẹp một error có kiểu không xác định về `FetchBaseQueryError`
 */
export function isFetchBaseQueryErrorType(error: unknown): error is FetchBaseQueryError {
  // sau : là type của giá trị trả về mong muốn
  return typeof error == 'object' && error !== null && 'status' in error
  // function eps type của error thành object, khác null, có status và kiểu FetchBaseQueryError
}

/**
 * Thu hẹp một error có kiểu không xác định về một object với thuộc tính message: string (SerializedError)
 */
export function isErrorWithMessageType(error: unknown): error is { message: string } {
  // error là 1 object khác null có thuộc tính message khác null vầ là string
  return typeof error == 'object' && error !== null && 'message' in error
}

/**
 * Thu hẹp một error có kiểu không xác định về lỗi liên quan đến POST PUT không đúng field (EntityError)
 */
export function isEntityError(error: unknown): error is EntityError {
  return (
    isFetchBaseQueryErrorType(error) &&
    error.status === 422 &&
    typeof error.data === 'object' &&
    error.data !== null &&
    !(error.data instanceof Array)
  )
}
