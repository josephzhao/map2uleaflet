<?php

namespace Map2u\LeafletBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * Geocoder controller.
 *
 * @Route("/")
 */
class GeocoderController extends Controller {

  /**
   * Geocoder controller.
   *
   * @Route("/search" , name="map2uleaflet_geocoder_search", options={"expose"=true})
   *  @Method("GET")
   * @Template()
   */
  public function searchAction(Request $request) {


    $query = $request->get('query');
    $latlon = $this->normalize_params($query);

    $sources = array();
    $params = array();
    if (isset($latlon['lat']) && !empty($latlon['lat']) && isset($latlon['lon']) && !empty($latlon['lon'])) {
      array_push($sources, "latlon");
      $params = array_merge($params, array('lat' => $latlon['lat'], 'lon' => $latlon['lon']));
      array_push($sources, "osm_nominatim_reverse");
      if (isset($GEONAMES_USERNAME) && !empty($GEONAMES_USERNAME)) {
        array_push($sources, "geonames_reverse");
      }
    }
    elseif (preg_match("/^\d{5}(-\d{4})?$/", $query)) {
      $params = array_merge($params, array('query' => $query));
      array_push($sources, "us_postcode");
      array_push($sources, "osm_nominatim");
    }
    elseif (preg_match("/^(GIR 0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKS-UW])\s*[0-9][ABD-HJLNP-UW-Z]{2})$/i", $query)) {
      $params = array_merge($params, array('query' => $query));
      array_push($sources, "uk_postcode");
      array_push($sources, "osm_nominatim");
    }
    elseif (preg_match("/^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i", $query)) {
      array_push($sources, "ca_postcode");
      $params = array_merge($params, array('query' => $query));
      array_push($sources, "osm_nominatim");
    }
    else {
      array_push($sources, "osm_nominatim");
      $params = array_merge($params, array('query' => $query));
      if (isset($GEONAMES_USERNAME) && !empty($GEONAMES_USERNAME)) {
        array_push($sources, "geonames");
      }
    }
    var_dump($sources);
    var_dump($params);
    foreach($sources as $source)
    {
      if($source==='ca_postcode') {
        $return=$this->search_ca_postcode($params['query']);
        var_dump($return);
      }
      if($source==='osm_nominatim') {
          $return=$this->search_osm_nominatim($params['query']);
          var_dump($return);
      }
    }
    return array('sources' => $sources, 'params' => $params);
    var_dump($sources);

    //  format=json&
    $url = 'http://nominatim.openstreetmap.org/reverse?lat=37.34&lon=-121.94';
    $data = file_get_contents($url);          //read the HTTP request
//$jsondata = json_decode($data,true);       //parse the JSOPN response
//if(is_array($jsondata))                    //check data
//{
//     //$addr = $jsondata['display_name'];
//}
//var_dump($jsondata);
//
//      
//      $url='http://www.openstreetmap.org/geocoder/search_osm_nominatim_reverse?lat=43.7787&lon=-79.2984&xhr=1';
//  //     http_request (HTTP_METH_PUT, 'www.example.com');
//$response = http_get($url, array("timeout"=>1), $info);
//
//var_dump($response);var_dump($info);
//print_r($info);
//    $r = new HttpRequest($url, HttpRequest::METH_GET);
//
//    try {
//        $r->send();
//        if ($r->getResponseCode() == 200) {
//             print_r($r->getResponseBody());
//        }
//    } catch (HttpException $ex) {
//        echo $ex;
//    }
//      $sources = [];
//      if(isset($lat)&& !empty($lat) && isset($lon)&& !empty($lon) )
//      {
//        array_push($sources, "latlon");
//        array_push($sources,"osm_nominatim_reverse");
//        if(isset($GEONAMES_USERNAME)&&!empty($GEONAMES_USERNAME))
//        {
//          array_push($sources,"geonames_reverse"); 
//        }
//      }
//      $matches='';
//      
//      preg_match('/^\d{5}(-\d{4})?$/', $query, $matches, PREG_OFFSET_CAPTURE);
//      
//      print_r($matches);
//      
    return new Response($data);
  }

  /**
   * Geocoder controller.
   *
   * @Route("/search_latlon" , name="map2uleaflet_geocoder_search_latlon")
   */
  public function search_latlonAction(Request $request) {
    $lat = floatval($request->get('lat'));
    $lon = floatval($request->get('lon'));
    $minlat = floatval($request->get('minlat'));
    $minlon = floatval($request->get('minlon'));
    $maxlat = floatval($request->get('maxlat'));
    $maxlon = floatval($request->get('maxlon'));


    if ($lat < -90 || $lat > 90) {
      $error = "Latitude " . $lat . " out of range";
      return $this->render('Map2uLeafletBundle:Geocoder:error.html.twig', array('error' => $error));
    }
    elseif ($lon < -180 || $lon > 180) {
      $error = "Longitude " . $lon . " out of range";
      return $this->render('Map2uLeafletBundle:Geocoder:error.html.twig', array('error' => $error));
    }
    else {
      $results = array('lat' => $lat, 'lon' => $lon, 'minlat' => $minlat, 'minlon' => $minlon, 'maxlat' => $maxlat, 'maxlon' => $maxlon, 'zoom' => $request->get('zoom'), 'name' => "$lat,$lon");
      return $this->render('Map2uLeafletBundle:Geocoder:results.html.twig', array('results' => $results));
    }
  }

  public function search_us_postcode() {
    
  }

  public function search_uk_postcode() {
    
  }

  private function search_ca_postcode($query) {
    $results = array();
    try {
      # ask geocoder.ca (note - they have a per-day limit)
      $response = $this->fetch_xml("http://geocoder.ca/?geoit=XML&postal=" . $this->escape_query($query));
      $error = trim((string) $response->error);
      # parse the response
      if (empty($error) || strlen($error) === 0) {
        $results = array_merge($results, array(
          'lat' => (string) $response->latt,
          'lon' => (string) $response->longt,
          'zoom' => 'POSTCODE_ZOOM',
          'name' => strtoupper($query)
        ));
      }
      return  $results;
//      return $this->render('Map2uLeafletBundle:Geocoder:results.html.twig', array('results' => $results));
    } catch (Exception $ex) {
      $error = "Error contacting geocoder.ca: " . $ex;
      return $this->render('Map2uLeafletBundle:Geocoder:error.html.twig', array('error' => $error));
    }
  }

  /**
   * Geocoder controller.
   *
   * @Route("/search_ca_postcode" , name="map2uleaflet_geocoder_search_ca_postcode")
   */
  public function search_ca_postcodeAction(Request $request) {
    $query = $request->get('query');
    $results = array();
    try {


      # ask geocoder.ca (note - they have a per-day limit)
      $response = $this->fetch_xml("http://geocoder.ca/?geoit=XML&postal=" . $this->escape_query($query));

      $error = trim((string) $response->error);
      # parse the response
      if (empty($error) || strlen($error) === 0) {
        $results = array_merge($results, array(
          'lat' => (string) $response->latt,
          'lon' => (string) $response->longt,
          'zoom' => 'POSTCODE_ZOOM',
          'name' => strtoupper($query)
        ));
      }
      return $this->render('Map2uLeafletBundle:Geocoder:results.html.twig', array('results' => $results));
    } catch (Exception $ex) {
      $error = "Error contacting geocoder.ca: " . $ex;
      return $this->render('Map2uLeafletBundle:Geocoder:error.html.twig', array('error' => $error));
    }
  }
private function search_osm_nominatim($query) {
     $response = $this->fetch_xml("http://open.mapquestapi.com/nominatim/v1/search?format=xml&q=".$this->escape_query($query));
    return $response;//
}
  /**
   * Geocoder controller.
   *
   * @Route("/search_osm_nominatim" , name="map2uleaflet_geocoder_search_osm_nominatim")
   */
  public function search_osm_nominatimAction(Request $request) {
    $query = $request->get('query');
    $results = array();
    //   var_dump($request);
    //    # get query parameters
//    query = params[:query]
//    minlon = params[:minlon]
//    minlat = params[:minlat]
//    maxlon = params[:maxlon]
//    maxlat = params[:maxlat]
//
//    # get view box
//    if minlon && minlat && maxlon && maxlat
//      viewbox = "&viewbox=#{minlon},#{maxlat},#{maxlon},#{minlat}"
//    end
//
//    # get objects to excude
//    if params[:exclude]
//      exclude = "&exclude_place_ids=#{params[:exclude].join(',')}"
//    end
//
//    # ask nominatim
//    response = fetch_xml("#{NOMINATIM_URL}search?format=xml&q=#{escape_query(query)}#{viewbox}#{exclude}&accept-language=#{http_accept_language.user_preferred_languages.join(',')}")
//
//    # create result array
//    @results = Array.new
//
//    # create parameter hash for "more results" link
//    @more_params = params.reverse_merge({ :exclude => [] })
//
//    # extract the results from the response
//    results =  response.elements["searchresults"]
//
//    # parse the response
//    results.elements.each("place") do |place|
//      lat = place.attributes["lat"].to_s
//      lon = place.attributes["lon"].to_s
//      klass = place.attributes["class"].to_s
//      type = place.attributes["type"].to_s
//      name = place.attributes["display_name"].to_s
//      min_lat,max_lat,min_lon,max_lon = place.attributes["boundingbox"].to_s.split(",")
//      if type.empty?
//        prefix_name = ""
//      else
//        prefix_name = t "geocoder.search_osm_nominatim.prefix.#{klass}.#{type}", :default => type.gsub("_", " ").capitalize
//      end
//      if klass == 'boundary' and type == 'administrative'
//        rank = (place.attributes["place_rank"].to_i + 1) / 2
//        prefix_name = t "geocoder.search_osm_nominatim.admin_levels.level#{rank}", :default => prefix_name
//      end
//      prefix = t "geocoder.search_osm_nominatim.prefix_format", :name => prefix_name
//      object_type = place.attributes["osm_type"]
//      object_id = place.attributes["osm_id"]
//
//      @results.push({:lat => lat, :lon => lon,
//                     :min_lat => min_lat, :max_lat => max_lat,
//                     :min_lon => min_lon, :max_lon => max_lon,
//                     :prefix => prefix, :name => name,
//                     :type => object_type, :id => object_id})
//      @more_params[:exclude].push(place.attributes["place_id"].to_s)
//    end
//
//    render :action => "results"
//#  rescue Exception => ex
//#    @error = "Error contacting nominatim.openstreetmap.org: #{ex.to_s}"
//#    render :action => "error"

    return new Response();
  }

  public function search_geonames($param) {
    
  }

  /**
   * Geocoder controller.
   *
   * @Route("/search_osm_nominatim_reverse" , name="map2uleaflet_geocoder_search_osm_nominatim_reverse")
   */
  public function search_osm_nominatim_reverseAction(Request $request) {
    $lat = floatval($request->get('lat'));
    $lon = floatval($request->get('lon'));
    if ($lat < -90 || $lat > 90) {
      $error = "Latitude " . $lat . " out of range";
      return $this->render('Map2uLeafletBundle:Geocoder:error.html.twig', array('error' => $error));
    }
    elseif ($lon < -180 || $lon > 180) {
      $error = "Longitude " . $lon . " out of range";
      return $this->render('Map2uLeafletBundle:Geocoder:error.html.twig', array('error' => $error));
    }
    else {
      $results = array('lat' => $lat, 'lon' => $lon, 'zoom' => $request->get('zoom'), 'name' => "$lat,$lon");
      return $this->render('Map2uLeafletBundle:Geocoder:results.html.twig', array('results' => $results));
    }
  }

  /**
   * Geocoder controller.
   *
   * @Route("/search_geonames_reverseAction" , name="map2uleaflet_geocoder_search_geonames_reverseAction")
   */
  public function search_geonames_reverseAction($param) {
    
  }

  private function fetch_text($url) {
    return file_get_contents($url);
  }

  private function fetch_xml($url) {
    return simplexml_load_string($this->fetch_text($url));
  }

  private function format_distance($distance) {
    return t("geocoder.distance", array('count' => 'distance'));
  }

  private function format_direction($bearing) {
    if ($bearing >= 22.5 && $bearing < 67.5)
      return t("geocoder.direction.south_west");
    if ($bearing >= 67.5 && $bearing < 112.5)
      return t("geocoder.direction.south");
    if ($bearing >= 112.5 && $bearing < 157.5)
      return t("geocoder.direction.south_east");
    if ($bearing >= 157.5 && $bearing < 202.5)
      return t("geocoder.direction.east");
    if ($bearing >= 202.5 && $bearing < 247.5)
      return t("geocoder.direction.north_east");
    if ($bearing >= 247.5 && $bearing < 292.5)
      return t("geocoder.direction.north");
    if ($bearing >= 292.5 && $bearing < 337.5)
      return t("geocoder.direction.north_west");
    return t("geocoder.direction.west");
  }

  private function format_name($name) {
    return preg_replace("/( *\[[^\]]*\])*$/", "", $name);
  }

  private function count_results($results) {
    $count = 0;

    foreach ($results as $source) {
      if ($source['results'])
        $count += $source['results'] . length;
    }
    return $count;
  }

  private function escape_query($query) {
    return urlencode($query); //URI.escape(query, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]", false, 'N'));
  }

  private function normalize_params($query) {
    // query = params[:query]
    if (!isset($query) || $query == null)
      return null;

    $query = trim($query);

//    preg_match_all("/^([NS])\s*(\d{1,3}(\.\d*)?)\W*([EW])\s*(\d{1,3}(\.\d*)?)$/", $query,$matches);
//    var_dump( $matches);
//
//    preg_match_all("/^(\d{1,3}(\.\d*)?)\s*([NS])\W*(\d{1,3}(\.\d*)?)\s*([EW])$/", $query,$matches);
//    var_dump( $matches);
//
//   preg_match_all("/^([NS])\s*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?$/", $query,$matches);
//    var_dump( $matches);
//
//    preg_match_all("/^(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\s*([NS])\W*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\s*([EW])$/", $query,$matches);
//    var_dump( $matches);
//
//    preg_match_all("/^([NS])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?[\"″]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?[\"″]?$/", $query,$matches);
//    var_dump( $matches);
//
//    preg_match_all("/^\s*([+-]?\d+(\.\d*)?)\s*[\s,]\s*([+-]?\d+(\.\d*)?)\s*$/", $query,$matches);
//    var_dump( $matches);


    if ($latlon = preg_match_all("/^([NS])\s*(\d{1,3}(\.\d*)?)\W*([EW])\s*(\d{1,3}(\.\d*)?)$/", $query, $matches)) { //# [NSEW] decimal degrees
      return $this->nsew_to_decdeg($matches);
    }
    elseif ($latlon = preg_match_all("/^(\d{1,3}(\.\d*)?)\s*([NS])\W*(\d{1,3}(\.\d*)?)\s*([EW])$/", $query, $matches)) {// # decimal degrees [NSEW]
      return $this->nsew_to_decdeg($matches);
    }
    elseif ($latlon = preg_match_all("/^([NS])\s*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?$/", $query, $matches)) {// # [NSEW] degrees, decimal minutes
      return $this->ddm_to_decdeg($matches);
    }
    elseif ($latlon = preg_match_all("/^(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\s*([NS])\W*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\s*([EW])$/", $query, $matches)) {// # degrees, decimal minutes [NSEW]
      return $this->ddm_to_decdeg($matches);
    }
    elseif ($latlon = preg_match_all("/^([NS])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?[\"″]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?[\"″]?$/", $query, $matches)) {// # [NSEW] degrees, minutes, decimal seconds
      return $this->dms_to_decdeg($matches);
    }
    elseif ($latlon = preg_match_all("/^(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?[\"″]\s*([NS])\W*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?[\"″]?\s*([EW])$/", $query, $matches)) {// # degrees, minutes, decimal seconds [NSEW]
      return $this->dms_to_decdeg($matches);
    }
    elseif ($latlon = preg_match_all("/^\s*([+-]?\d+(\.\d*)?)\s*[\s,]\s*([+-]?\d+(\.\d*)?)\s*$/", $query, $matches)) {

      //   var_dump($matches);

      return array('lat' => floatval($matches[1][0]), 'lon' => floatval($matches[3][0]));
    }
  }

//
  private function nsew_to_decdeg($captures) {
    try {
      strtolower($captures[2]) != 's' ? $lat = floatval($captures[0]) : $lat = -(floatval($captures[0]));
      strtolower($captures[5]) != 'w' ? $lon = floatval($captures[3]) : $lon = -(floatval($captures[3]));
    } catch (Exception $ex) {
      strtolower($captures[0]) != 's' ? $lat = floatval($captures[1]) : $lat = -(floatval($captures[1]));
      strtolower($captures[3]) != 'w' ? $lon = floatval($captures[4]) : $lon = -(floatval($captures[4]));
    }
    return array('lat' => $lat, 'lon' => $lon);
  }

  private function ddm_to_decdeg($captures) {
    try {
      strtolower($captures[3]) != 's' ? $lat = floatval($captures[0]) + floatval($captures[1]) / 60 : $lat = -(floatval($captures[0]) + floatval($captures[1]) / 60);
      strtolower($captures[7]) != 'w' ? $lon = floatval($captures[4]) + floatval($captures[5]) / 60 : $lon = -(floatval($captures[4]) + floatval($captures[5]) / 60);
    } catch (Exception $ex) {
      strtolower($captures[0]) != 's' ? $lat = floatval($captures[1]) + floatval($captures[2]) / 60 : $lat = -(floatval($captures[1]) + floatval($captures[2]) / 60);
      strtolower($captures[4]) != 'w' ? $lon = floatval($captures[5]) + floatval($captures[6]) / 60 : $lon = -(floatval($captures[5]) + floatval($captures[6]) / 60);
    }
    return array('lat' => $lat, 'lon' => $lon);
  }

//    begin
//      Float(captures[0])
//      captures[3].downcase != 's' ? lat = captures[0].to_f + captures[1].to_f/60 : lat = -(captures[0].to_f + captures[1].to_f/60)
//      captures[7].downcase != 'w' ? lon = captures[4].to_f + captures[5].to_f/60 : lon = -(captures[4].to_f + captures[5].to_f/60)
//    rescue
//      captures[0].downcase != 's' ? lat = captures[1].to_f + captures[2].to_f/60 : lat = -(captures[1].to_f + captures[2].to_f/60)
//      captures[4].downcase != 'w' ? lon = captures[5].to_f + captures[6].to_f/60 : lon = -(captures[5].to_f + captures[6].to_f/60)
//    end
//    {:lat => lat, :lon => lon}
//  end
//
  private function dms_to_decdeg($captures) {
    try {
      strtolower($captures[4]) != 's' ? $lat = floatval($captures[0]) + (floatval($captures[1]) + floatval($captures[2]) / 60) / 60 : $lat = -(floatval($captures[0]) + (floatval($captures[1]) + floatval($captures[2]) / 60) / 60);
      strtolower($captures[9]) != 'w' ? $lon = floatval($captures[5]) + (floatval($captures[6]) + floatval($captures[7]) / 60) / 60 : $lon = -(floatval($captures[5]) + (floatval($captures[6]) + floatval($captures[7]) / 60) / 60);
    } catch (Exception $ex) {
      strtolower($captures[0]) != 's' ? $lat = floatval($captures[1]) + (floatval($captures[2]) + floatval($captures[3]) / 60) / 60 : $lat = -(floatval($captures[1]) + (floatval($captures[2]) + floatval($captures[3]) / 60) / 60);
      strtolower($captures[5]) != 'w' ? $lon = floatval($captures[6]) + (floatval($captures[7]) + floatval($captures[8]) / 60) / 60 : $lon = -(floatval($captures[6]) + (floatval($captures[7]) + floatval($captures[8]) / 60) / 60);
    }
    return array('lat' => $lat, 'lon' => $lon);
  }

  public function results() {
    return array();
  }

  public function error() {
    return array();
  }

//    begin
//      Float(captures[0])
//      captures[4].downcase != 's' ? lat = captures[0].to_f + (captures[1].to_f + captures[2].to_f/60)/60 : lat = -(captures[0].to_f + (captures[1].to_f + captures[2].to_f/60)/60)
//      captures[9].downcase != 'w' ? lon = captures[5].to_f + (captures[6].to_f + captures[7].to_f/60)/60 : lon = -(captures[5].to_f + (captures[6].to_f + captures[7].to_f/60)/60)
//    rescue
//      captures[0].downcase != 's' ? lat = captures[1].to_f + (captures[2].to_f + captures[3].to_f/60)/60 : lat = -(captures[1].to_f + (captures[2].to_f + captures[3].to_f/60)/60)
//      captures[5].downcase != 'w' ? lon = captures[6].to_f + (captures[7].to_f + captures[8].to_f/60)/60 : lon = -(captures[6].to_f + (captures[7].to_f + captures[8].to_f/60)/60)
//    end
//    {:lat => lat, :lon => lon}
//  end
//
}

//
//
//# coding: utf-8
//
//class GeocoderController < ApplicationController
//  require 'uri'
//  require 'net/http'
//  require 'rexml/document'
//
//  before_filter :authorize_web
//  before_filter :set_locale
//  before_filter :require_oauth, :only => [:search]
//
//  def search
//    normalize_params
//
//    @sources = []
//    if params[:lat] && params[:lon]
//      @sources.push "latlon"
//      @sources.push "osm_nominatim_reverse"
//      @sources.push "geonames_reverse" if defined?(GEONAMES_USERNAME)
//    elsif params[:query].match(/^\d{5}(-\d{4})?$/)
//      @sources.push "us_postcode"
//      @sources.push "osm_nominatim"
//    elsif params[:query].match(/^(GIR 0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKS-UW])\s*[0-9][ABD-HJLNP-UW-Z]{2})$/i)
//      @sources.push "uk_postcode"
//      @sources.push "osm_nominatim"
//    elsif params[:query].match(/^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i)
//      @sources.push "ca_postcode"
//      @sources.push "osm_nominatim"
//    else
//      @sources.push "osm_nominatim"
//      @sources.push "geonames" if defined?(GEONAMES_USERNAME)
//    end
//
//    render :layout => map_layout
//  end
//
//  def search_latlon
//    lat = params[:lat].to_f
//    lon = params[:lon].to_f
//    if lat < -90 or lat > 90
//      @error = "Latitude #{lat} out of range"
//      render :action => "error"
//    elsif lon < -180 or lon > 180
//      @error = "Longitude #{lon} out of range"
//      render :action => "error"
//    else
//      @results = [{:lat => lat, :lon => lon,
//                   :zoom => params[:zoom],
//                   :name => "#{lat}, #{lon}"}]
//
//      render :action => "results"
//    end
//  end
//
//  def search_us_postcode
//    # get query parameters
//    query = params[:query]
//
//    # create result array
//    @results = Array.new
//
//    # ask geocoder.us (they have a non-commercial use api)
//    response = fetch_text("http://rpc.geocoder.us/service/csv?zip=#{escape_query(query)}")
//
//    # parse the response
//    unless response.match(/couldn't find this zip/)
//      data = response.split(/\s*,\s+/) # lat,long,town,state,zip
//      @results.push({:lat => data[0], :lon => data[1],
//                     :zoom => POSTCODE_ZOOM,
//                     :prefix => "#{data[2]}, #{data[3]},",
//                     :name => data[4]})
//    end
//
//    render :action => "results"
//  rescue Exception => ex
//    @error = "Error contacting rpc.geocoder.us: #{ex.to_s}"
//    render :action => "error"
//  end
//
//  def search_uk_postcode
//    # get query parameters
//    query = params[:query]
//
//    # create result array
//    @results = Array.new
//
//    # ask npemap.org.uk to do a combined npemap + freethepostcode search
//    response = fetch_text("http://www.npemap.org.uk/cgi/geocoder.fcgi?format=text&postcode=#{escape_query(query)}")
//
//    # parse the response
//    unless response.match(/Error/)
//      dataline = response.split(/\n/)[1]
//      data = dataline.split(/,/) # easting,northing,postcode,lat,long
//      postcode = data[2].gsub(/'/, "")
//      zoom = POSTCODE_ZOOM - postcode.count("#")
//      @results.push({:lat => data[3], :lon => data[4], :zoom => zoom,
//                     :name => postcode})
//    end
//
//    render :action => "results"
//  rescue Exception => ex
//    @error = "Error contacting www.npemap.org.uk: #{ex.to_s}"
//    render :action => "error"
//  end
//
//  def search_ca_postcode
//    # get query parameters
//    query = params[:query]
//    @results = Array.new
//
//    # ask geocoder.ca (note - they have a per-day limit)
//    response = fetch_xml("http://geocoder.ca/?geoit=XML&postal=#{escape_query(query)}")
//
//    # parse the response
//    if response.get_elements("geodata/error").empty?
//      @results.push({:lat => response.get_text("geodata/latt").to_s,
//                     :lon => response.get_text("geodata/longt").to_s,
//                     :zoom => POSTCODE_ZOOM,
//                     :name => query.upcase})
//    end
//
//    render :action => "results"
//  rescue Exception => ex
//    @error = "Error contacting geocoder.ca: #{ex.to_s}"
//    render :action => "error"
//  end
//
//  def search_osm_nominatim
//    # get query parameters
//    query = params[:query]
//    minlon = params[:minlon]
//    minlat = params[:minlat]
//    maxlon = params[:maxlon]
//    maxlat = params[:maxlat]
//
//    # get view box
//    if minlon && minlat && maxlon && maxlat
//      viewbox = "&viewbox=#{minlon},#{maxlat},#{maxlon},#{minlat}"
//    end
//
//    # get objects to excude
//    if params[:exclude]
//      exclude = "&exclude_place_ids=#{params[:exclude].join(',')}"
//    end
//
//    # ask nominatim
//    response = fetch_xml("#{NOMINATIM_URL}search?format=xml&q=#{escape_query(query)}#{viewbox}#{exclude}&accept-language=#{http_accept_language.user_preferred_languages.join(',')}")
//
//    # create result array
//    @results = Array.new
//
//    # create parameter hash for "more results" link
//    @more_params = params.reverse_merge({ :exclude => [] })
//
//    # extract the results from the response
//    results =  response.elements["searchresults"]
//
//    # parse the response
//    results.elements.each("place") do |place|
//      lat = place.attributes["lat"].to_s
//      lon = place.attributes["lon"].to_s
//      klass = place.attributes["class"].to_s
//      type = place.attributes["type"].to_s
//      name = place.attributes["display_name"].to_s
//      min_lat,max_lat,min_lon,max_lon = place.attributes["boundingbox"].to_s.split(",")
//      if type.empty?
//        prefix_name = ""
//      else
//        prefix_name = t "geocoder.search_osm_nominatim.prefix.#{klass}.#{type}", :default => type.gsub("_", " ").capitalize
//      end
//      if klass == 'boundary' and type == 'administrative'
//        rank = (place.attributes["place_rank"].to_i + 1) / 2
//        prefix_name = t "geocoder.search_osm_nominatim.admin_levels.level#{rank}", :default => prefix_name
//      end
//      prefix = t "geocoder.search_osm_nominatim.prefix_format", :name => prefix_name
//      object_type = place.attributes["osm_type"]
//      object_id = place.attributes["osm_id"]
//
//      @results.push({:lat => lat, :lon => lon,
//                     :min_lat => min_lat, :max_lat => max_lat,
//                     :min_lon => min_lon, :max_lon => max_lon,
//                     :prefix => prefix, :name => name,
//                     :type => object_type, :id => object_id})
//      @more_params[:exclude].push(place.attributes["place_id"].to_s)
//    end
//
//    render :action => "results"
//#  rescue Exception => ex
//#    @error = "Error contacting nominatim.openstreetmap.org: #{ex.to_s}"
//#    render :action => "error"
//  end
//
//  def search_geonames
//    # get query parameters
//    query = params[:query]
//
//    # get preferred language
//    lang = I18n.locale.to_s.split("-").first
//
//    # create result array
//    @results = Array.new
//
//    # ask geonames.org
//    response = fetch_xml("http://api.geonames.org/search?q=#{escape_query(query)}&lang=#{lang}&maxRows=20&username=#{GEONAMES_USERNAME}")
//
//    # parse the response
//    response.elements.each("geonames/geoname") do |geoname|
//      lat = geoname.get_text("lat").to_s
//      lon = geoname.get_text("lng").to_s
//      name = geoname.get_text("name").to_s
//      country = geoname.get_text("countryName").to_s
//      @results.push({:lat => lat, :lon => lon,
//                     :zoom => GEONAMES_ZOOM,
//                     :name => name,
//                     :suffix => ", #{country}"})
//    end
//
//    render :action => "results"
//  rescue Exception => ex
//    @error = "Error contacting ws.geonames.org: #{ex.to_s}"
//    render :action => "error"
//  end
//
//  def search_osm_nominatim_reverse
//    # get query parameters
//    lat = params[:lat]
//    lon = params[:lon]
//    zoom = params[:zoom]
//
//    # create result array
//    @results = Array.new
//
//    # ask nominatim
//    response = fetch_xml("#{NOMINATIM_URL}reverse?lat=#{lat}&lon=#{lon}&zoom=#{zoom}&accept-language=#{http_accept_language.user_preferred_languages.join(',')}")
//
//    # parse the response
//    response.elements.each("reversegeocode/result") do |result|
//      lat = result.attributes["lat"].to_s
//      lon = result.attributes["lon"].to_s
//      object_type = result.attributes["osm_type"]
//      object_id = result.attributes["osm_id"]
//      description = result.get_text.to_s
//
//      @results.push({:lat => lat, :lon => lon,
//                     :zoom => zoom,
//                     :name => description,
//                     :type => object_type, :id => object_id})
//    end
//
//    render :action => "results"
//  rescue Exception => ex
//    @error = "Error contacting nominatim.openstreetmap.org: #{ex.to_s}"
//    render :action => "error"
//  end
//
//  def search_geonames_reverse
//    # get query parameters
//    lat = params[:lat]
//    lon = params[:lon]
//
//    # get preferred language
//    lang = I18n.locale.to_s.split("-").first
//
//    # create result array
//    @results = Array.new
//
//    # ask geonames.org
//    response = fetch_xml("http://api.geonames.org/countrySubdivision?lat=#{lat}&lng=#{lon}&lang=#{lang}&username=#{GEONAMES_USERNAME}")
//
//    # parse the response
//    response.elements.each("geonames/countrySubdivision") do |geoname|
//      name = geoname.get_text("adminName1").to_s
//      country = geoname.get_text("countryName").to_s
//      @results.push({:lat => lat, :lon => lon,
//                     :zoom => GEONAMES_ZOOM,
//                     :name => name,
//                     :suffix => ", #{country}"})
//    end
//
//    render :action => "results"
//  rescue Exception => ex
//    @error = "Error contacting ws.geonames.org: #{ex.to_s}"
//    render :action => "error"
//  end
//
//private
//
//  def fetch_text(url)
//    return Net::HTTP.get(URI.parse(url))
//  end
//
//  def fetch_xml(url)
//    return REXML::Document.new(fetch_text(url))
//  end
//
//  def format_distance(distance)
//    return t("geocoder.distance", :count => distance)
//  end
//
//  def format_direction(bearing)
//    return t("geocoder.direction.south_west") if bearing >= 22.5 and bearing < 67.5
//    return t("geocoder.direction.south") if bearing >= 67.5 and bearing < 112.5
//    return t("geocoder.direction.south_east") if bearing >= 112.5 and bearing < 157.5
//    return t("geocoder.direction.east") if bearing >= 157.5 and bearing < 202.5
//    return t("geocoder.direction.north_east") if bearing >= 202.5 and bearing < 247.5
//    return t("geocoder.direction.north") if bearing >= 247.5 and bearing < 292.5
//    return t("geocoder.direction.north_west") if bearing >= 292.5 and bearing < 337.5
//    return t("geocoder.direction.west")
//  end
//
//  def format_name(name)
//    return name.gsub(/( *\[[^\]]*\])*$/, "")
//  end
//
//  def count_results(results)
//    count = 0
//
//    results.each do |source|
//      count += source[:results].length if source[:results]
//    end
//
//    return count
//  end
//
//  def escape_query(query)
//    return URI.escape(query, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]", false, 'N'))
//  end
//
//  def normalize_params
//    query = params[:query]
//    return unless query
//
//    query.strip!
//
//    if latlon = query.match(/^([NS])\s*(\d{1,3}(\.\d*)?)\W*([EW])\s*(\d{1,3}(\.\d*)?)$/).try(:captures) # [NSEW] decimal degrees
//      params.merge!(nsew_to_decdeg(latlon)).delete(:query)
//    elsif latlon = query.match(/^(\d{1,3}(\.\d*)?)\s*([NS])\W*(\d{1,3}(\.\d*)?)\s*([EW])$/).try(:captures) # decimal degrees [NSEW]
//      params.merge!(nsew_to_decdeg(latlon)).delete(:query)
//
//    elsif latlon = query.match(/^([NS])\s*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?$/).try(:captures) # [NSEW] degrees, decimal minutes
//      params.merge!(ddm_to_decdeg(latlon)).delete(:query)
//    elsif latlon = query.match(/^(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\s*([NS])\W*(\d{1,3})°?\s*(\d{1,3}(\.\d*)?)?['′]?\s*([EW])$/).try(:captures) # degrees, decimal minutes [NSEW]
//      params.merge!(ddm_to_decdeg(latlon)).delete(:query)
//
//    elsif latlon = query.match(/^([NS])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?["″]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?["″]?$/).try(:captures) # [NSEW] degrees, minutes, decimal seconds
//      params.merge!(dms_to_decdeg(latlon)).delete(:query)
//    elsif latlon = query.match(/^(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?["″]\s*([NS])\W*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(\.\d*)?)?["″]?\s*([EW])$/).try(:captures) # degrees, minutes, decimal seconds [NSEW]
//      params.merge!(dms_to_decdeg(latlon)).delete(:query)
//
//    elsif latlon = query.match(/^\s*([+-]?\d+(\.\d*)?)\s*[\s,]\s*([+-]?\d+(\.\d*)?)\s*$/)
//      params.merge!({:lat => latlon[1].to_f, :lon => latlon[3].to_f}).delete(:query)
//    end
//  end
//
//  def nsew_to_decdeg(captures)
//    begin
//      Float(captures[0])
//      captures[2].downcase != 's' ? lat = captures[0].to_f : lat = -(captures[0].to_f)
//      captures[5].downcase != 'w' ? lon = captures[3].to_f : lon = -(captures[3].to_f)
//    rescue
//      captures[0].downcase != 's' ? lat = captures[1].to_f : lat = -(captures[1].to_f)
//      captures[3].downcase != 'w' ? lon = captures[4].to_f : lon = -(captures[4].to_f)
//    end
//    {:lat => lat, :lon => lon}
//  end
//
//  def ddm_to_decdeg(captures)
//    begin
//      Float(captures[0])
//      captures[3].downcase != 's' ? lat = captures[0].to_f + captures[1].to_f/60 : lat = -(captures[0].to_f + captures[1].to_f/60)
//      captures[7].downcase != 'w' ? lon = captures[4].to_f + captures[5].to_f/60 : lon = -(captures[4].to_f + captures[5].to_f/60)
//    rescue
//      captures[0].downcase != 's' ? lat = captures[1].to_f + captures[2].to_f/60 : lat = -(captures[1].to_f + captures[2].to_f/60)
//      captures[4].downcase != 'w' ? lon = captures[5].to_f + captures[6].to_f/60 : lon = -(captures[5].to_f + captures[6].to_f/60)
//    end
//    {:lat => lat, :lon => lon}
//  end
//
//  def dms_to_decdeg(captures)
//    begin
//      Float(captures[0])
//      captures[4].downcase != 's' ? lat = captures[0].to_f + (captures[1].to_f + captures[2].to_f/60)/60 : lat = -(captures[0].to_f + (captures[1].to_f + captures[2].to_f/60)/60)
//      captures[9].downcase != 'w' ? lon = captures[5].to_f + (captures[6].to_f + captures[7].to_f/60)/60 : lon = -(captures[5].to_f + (captures[6].to_f + captures[7].to_f/60)/60)
//    rescue
//      captures[0].downcase != 's' ? lat = captures[1].to_f + (captures[2].to_f + captures[3].to_f/60)/60 : lat = -(captures[1].to_f + (captures[2].to_f + captures[3].to_f/60)/60)
//      captures[5].downcase != 'w' ? lon = captures[6].to_f + (captures[7].to_f + captures[8].to_f/60)/60 : lon = -(captures[6].to_f + (captures[7].to_f + captures[8].to_f/60)/60)
//    end
//    {:lat => lat, :lon => lon}
//  end
//
//end
