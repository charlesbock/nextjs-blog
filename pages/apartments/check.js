import Link from 'next/link'
import Head from 'next/head'
import Layout from '../../components/layout'
import { render } from 'react-dom'
import { stringToSlug } from '../../helpers/functions'
import { getLatitudeFromPoint, getLongitudeFromPoint } from '../../helpers/functions'

export async function getServerSideProps() {
    
    const fincaRaizResponse = await fetch(`https://api.fincaraiz.com.co/document/api/1.0/listing/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://www.fincaraiz.com.co',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://www.fincaraiz.com.co/'
        },
        body: JSON.stringify(require('../../components/finca-raiz-body.json'))
    })
    const fincaRaizData = await fincaRaizResponse.json()

    const metroCuadradoResponse = await fetch(`https://www.metrocuadrado.com/rest-search/msearch?bedrooms=&areaRange=&bathrooms=&garages=&priceRangeLease=&priceRangeSale=&amenities=&status=&keyword=&buildTime=&businessType=arriendo&propertyType=1&sortField=&sortOrder=&from=0&size=20&city=barranquilla&neighborhood=San%20Vicente&zone=&latitude=11.00425&longitude=-74.81612&distance=0.2&latitudeGeoPlaces=11.00425&longitudeGeoPlaces=-74.81612&stratum=`, {
        method: 'GET',
        headers: {
            "user-agent": "okhttp/3.12.12",
            "host": "www.metrocuadrado.com",
            "connection": "Keep-Alive",
            "accept-encoding": "gzip",
            "accept": "application/json",
            "x-api-key": "PviN4KKFgYfTNNyZQQfJngBodoJEqJ4t"
        }
    })
    const metroCuadradoData = await metroCuadradoResponse.json()

    const listingsData = {
        fincaRaiz: fincaRaizData,
        metroCuadrado: metroCuadradoData
    }
      
    return { props: { listingsData: listingsData } }
  }

export default function Page({ listingsData }) {

    // Finca Raiz
    
    let fincaRaizlistings = listingsData.fincaRaiz.hits.hits
    let apartments = []

    let config = require('../../components/config.json')
    let excludes = config.excludes
    let maxPrice = config.maxPrice
    let minRooms = config.minRooms
    let minArea = config.minArea

    for (let i = 0; i < fincaRaizlistings.length; i++) {
        var listing = fincaRaizlistings[i]._source.listing
        let origin = "Finca Raiz"
        let id = listing.fr_property_id
        let price = Math.trunc(listing.price)
        let rooms = listing.rooms.name
        let area = listing.area

        if(!excludes.includes(id) && price <= maxPrice && rooms >= minRooms && area >= minArea) {            
            let title = listing.title
            let baths = listing.baths.name
            let client = (listing.client.company_name || ( listing.client.first_name + " " + listing.client.last_name))
            let clientType = listing.client.client_type
            let url = "https://fincaraiz.com.co/inmueble/" + stringToSlug(title) + "/" + listing.locations.neighbourhoods[0].name + "/" + listing.locations.cities[0].name + "/" + id
            let location = "https://www.google.com/maps/search/" + getLatitudeFromPoint(listing.locations.location_point) + "," + getLongitudeFromPoint(listing.locations.location_point)
    
            let apartment = { origin: origin, id: id, title: title, area: area, price: price, rooms: rooms, baths: baths, client: client, clientType: clientType, url: url , location}
    
            apartments.push(apartment)        
        }
    }

    let metroCuadradoListings = listingsData.metroCuadrado.data.results

    for (let i = 0; i < metroCuadradoListings.length; i++) {
        var listing = metroCuadradoListings[i]
        let origin = "Metro Cuadrado"
        let id = listing.id
        let price = Math.trunc(listing.pricelease)
        let rooms = listing.bedrooms
        let area = listing.area.replace( " m2","")

        if(!excludes.includes(id) && price <= maxPrice && rooms >= minRooms && area >= minArea) {            
            let title = listing.title
            let baths = listing.baths
            let client = ""
            let clientType = ""
            let url = listing.url
            let location = ""
    
            let apartment = { origin: origin, id: id, title: title, area: area, price: price, rooms: rooms, baths: baths, client: client, clientType: clientType, url: url , location}
    
            apartments.push(apartment)        
        }
    }

    apartments = apartments.sort((a,b) => {
        if(a.price < b.price) { return -1 }
        if(a.price > b.price) { return 1 }
        return 0
    })

    // Return HTML

    var formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      });

    return (

        <table border={1} cellPadding={5}>
            <thead>
                <tr key="header">
                    <td>Fuente</td>
                    <td>ID</td>
                    <td>Título</td>
                    <td>Área</td>
                    <td>Precio</td>
                    <td>Habitaciones</td>
                    <td>Baños</td>
                    <td>Cliente</td>
                    <td>Tipo de Cliente</td>
                    <td>Link</td>
                    <td>Mapa</td>
                </tr>
            </thead>
            <tbody>
                { apartments.map(({ origin, id, title, area, price, rooms, baths, client, clientType, url, location }) => (
                    <tr key={ id }>
                        <td>{ origin }</td>
                        <td>{ id }</td>
                        <td>{ title }</td>
                        <td>{ Math.trunc(area) } m²</td>
                        <td>{ formatter.format(price) }</td>
                        <td>{ rooms }</td>  
                        <td>{ baths }</td>               
                        <td>{ client }</td>
                        <td>{ clientType }</td>
                        <td><Link href={ url }><a>Ver</a></Link></td>
                        <td><Link href={ location || '#' }><a>Mapa</a></Link></td>
                    </tr>
                ))}
            </tbody>
        </table>
        
    )
}
