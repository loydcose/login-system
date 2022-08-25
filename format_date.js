const formatDate = (d) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]

  const date = new Date(d)
  const month = date.getMonth()
  const day = date.getDate()
  const year = date.getFullYear()

  return `${months[month - 1]} ${day}, ${year}`

}

module.exports = formatDate