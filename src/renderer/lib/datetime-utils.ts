import { t } from 'i18next'

export const formatPlaytime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return `< 1m`
  }
}

export const formatLastPlayed = (timestamp: number) => {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))

  if (diffMinutes < 1) {
    return t('translation:common.dates.just_now')
  } else if (diffMinutes < 60) {
    return t('translation:common.dates.minutes_ago', { number: diffMinutes })
  } else if (diffHours < 24) {
    return t('translation:common.dates.hours_ago', { number: diffHours })
  } else if (diffDays === 1) {
    return t('translation:common.dates.one_day_ago')
  } else if (diffDays < 7) {
    return t('translation:common.dates.days_ago', { number: diffDays })
  } else if (diffWeeks === 1) {
    return t('translation:common.dates.one_week_ago')
  } else if (diffWeeks < 4) {
    return t('translation:common.dates.weeks_ago', { number: diffWeeks })
  } else if (diffMonths === 1) {
    return t('translation:common.dates.one_month_ago')
  } else {
    return t('translation:common.dates.months_ago', { number: diffMonths })
  }
}
