export default function formatDate(latestdate){
    let formattedDate = new Date(latestdate).toLocaleString()
    return formattedDate
} 