const reviewRoutesFlag = process.env.NEXT_PUBLIC_ENABLE_REVIEW_ROUTES

export function areReviewRoutesEnabled() {
  if (reviewRoutesFlag === 'true') {
    return true
  }

  if (reviewRoutesFlag === 'false') {
    return false
  }

  return process.env.NODE_ENV !== 'production'
}
