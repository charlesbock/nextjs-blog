export function stringToSlug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export function getLongitudeFromPoint(str) {
    str = str.trim()
    
    if(str.startsWith("POINT")) {
        let cleanStr = str.replace("POINT (", "").replace(")", "")
        let coordinates = cleanStr.split(" ")
        return coordinates[0]
    }

    return ""
}

export function getLatitudeFromPoint(str) {
    str = str.trim()
    
    if(str.startsWith("POINT")) {
        let cleanStr = str.replace("POINT (", "").replace(")", "")
        let coordinates = cleanStr.split(" ")
        return coordinates[1]
    }

    return ""
}
