<?php

namespace Map2u\LeafletBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Map2u\CoreBundle\Entity\UploadShapefileLayer;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * Map2u Leaflet Default controller.
 *
 * @Route("/leaflet")
 */
class DefaultController extends Controller {

  public function indexAction($name) {
    return $this->render('Map2uLeafletBundle:Default:index.html.twig', array('name' => $name));
  }

  public function leaflet_map_jsAction() {
    return $this->render('Map2uLeafletBundle:Default:leaflet_map_js.html.twig');
  }

  public function mapAction() {


    return $this->render('Map2uLeafletBundle:Default:map.html.twig');
  }

  /**
   * get map layers extend.
   * params: 
   * @Route("/userlayers", name="leaflet_userlayers", options={"expose"=true})
   * @Method("GET|POST")
   * @Template()
   */
  public function userLayersAction() {
    $em = $this->getDoctrine()->getManager();

    if ($this->getUser()) {
      $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadShapefileLayer p where p.userId=' . $this->getUser()->getId() . ' or p.published = true ORDER BY p.layerName ASC')
          ->getResult();
    }
    else {
      $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadShapefileLayer p where  p.published = true ORDER BY p.layerName ASC')
          ->getResult();
    }

    if ($layers) {
      $layers_data = array();

      $message = '';
      $success = true;
      foreach ($layers as $layer) {
        $layers_data[$layer->getId()] = array();
        $layers_data[$layer->getId()]['id'] = $layer->getId();
        $layers_data[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
        $layers_data[$layer->getId()]['layerName'] = $layer->getLayerName();
        $layers_data[$layer->getId()]['layerShowInSwitcher'] = $layer->getLayerShowInSwitcher();
        $layers_data[$layer->getId()]['shapefileName'] = $layer->getUseruploadshapefile()->getShapefileName();
      }
      return new Response(\json_encode(array('success' => $success, 'message' => $message, 'layers' => $layers_data)));
    }
    return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist')));
  }

  /**
   * get map layers extend.
   * params: 
   * @Route("/maplayers", name="leaflet_maplayers", options={"expose"=true})
   * @Method("GET|POST")
   * @Template()
   */
  public function mapLayersAction() {

    $em = $this->getDoctrine()->getManager();
    $user = $this->getUser();

    // data path for sld file and uploaded shapefiles
    $data_path = $this->get('kernel')->getRootDir() . '/../Data';
    echo $user;
    if ($user && $user !== '') {
      $layers = $em//->getRepository('Map2uCoreBundle:UploadShapefileLayer')//->find(array('userId' => $user->getId()));
          ->createQuery('SELECT p FROM Map2uCoreBundle:UploadShapefileLayer p where p.userId=' . $user->getId() . ' or p.published = true ORDER BY p.layerName ASC')
          ->getResult();
    }
    else {
      $layers = $em//->getRepository('Map2uCoreBundle:UploadShapefileLayer')//->find(array('userId' => $user->getId()));
          ->createQuery('SELECT p FROM Map2uCoreBundle:UploadShapefileLayer p where  p.published = true ORDER BY p.layerName ASC')
          ->getResult();
    }
 //   var_dump($layers);
    if ($layers) {
      $layers_data = array();
      $conn = $this->get('database_connection');
      $geoms = array();
      $message = '';
      $success = true;
      foreach ($layers as $layer) {
        $geoms[$layer->getId()] = array();
        $layers_data[$layer->getId()] = array();
        $layers_data[$layer->getId()]['id'] = $layer->getId();
        $layers_data[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
        $layers_data[$layer->getId()]['layerName'] = $layer->getLayerName();
        $layers_data[$layer->getId()]['layerShowInSwitcher'] = $layer->getLayerShowInSwitcher();
        $layers_data[$layer->getId()]['shapefileName'] = $layer->getUseruploadshapefile()->getShapefileName();

        if ($layer->getTopojsonOnly() === true && $user) {

          $geoms[$layer->getId()]['type'] = "topojsonfile";
          //    /uploads/shapefiles/' . $user->getId() . '/u' . $useruploadshapefile->getId() . '_' . $useruploadshapefile->getTopojsonfileName()
          if (file_exists($data_path . '/shapefiles/' . $user->getId() . '/u' . $layer->getUseruploadshapefile()->getId() . '_' . $layer->getUseruploadshapefile()->getTopojsonfileName())) {
            $the_geom = file_get_contents('/uploads/shapefiles/' . $user->getId() . '/u' . $layer->getUseruploadshapefile()->getId() . '_' . $layer->getUseruploadshapefile()->getTopojsonfileName());
            $geoms[$layer->getId()]['geom'] = $the_geom;
          }
          else {
            $message = 'Topojson file ' . $layer->getUseruploadshapefile()->getTopojsonfileName() . ' not exist!';
            $success = false;
            $sql = "select st_asgeojson(st_transform(the_geom,4326)) from useruploadshapefile_geoms_" . $layer->getId();

            $geoms[$layer->getId()]['type'] = "geojson";
            $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
          }
        }
        else {
          $sql = "select st_asgeojson(the_geom) from useruploadshapefile_geoms_" . $layer->getId();

          $geoms[$layer->getId()]['type'] = "geojson";
          $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
        }
      }

      if ($layers[0]->getDefaultSldName() && file_exists($data_path . '/sld/' . $layers[0]->getDefaultSldName())) {
        //    echo $layers[0]->getDefaultSldName();

        $sldfile_content = file_get_contents($data_path . '/sld/' . $layers[0]->getDefaultSldName());
        $sldstring = str_replace('ogc:', '', $sldfile_content);
        $sldxml = simplexml_load_string($sldstring);
        var_dump($sldxml);
        $json = json_encode($sldxml);

        var_dump($json);
      }
      return new Response(\json_encode(array('success' => $success, 'message' => $message, 'layers' => $layers_data, 'sld' => $json, 'data' => $geoms)));
    }
    return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist')));
  }

  /**
   * get map layers extend.
   * params: 
   * @Route("/maplayer", name="leaflet_maplayer", options={"expose"=true})
   * @Method("GET|POST")
   * @Template()
   */
  public function mapLayerAction(Request $request) {

    $em = $this->getDoctrine()->getManager();
    $user = $this->getUser();
    $id = $request->get("id");
    $type = $request->get("type");

    // shapefiles path for uploaded shapefiles
    $shapefiles_path = $this->get('kernel')->getRootDir() . '/../Data';


    if (!$user) {
      return new Response(\json_encode(array('success' => false, 'message' => 'Please Login first!')));
    }
    else {
      if ($type === 'topojson' || $type === 'shapefile_topojson') {

        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadShapefileLayer p where p.id=' . $id)
            ->getResult();

        if ($layers) {
          $layers_data = array();
          $conn = $this->get('database_connection');
          $geoms = array();
          $message = '';
          $success = true;

          foreach ($layers as $layer) {
            $geoms[$layer->getId()] = array();
            $layers_data[$layer->getId()] = array();
            $layers_data[$layer->getId()]['id'] = $layer->getId();
            $layers_data[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
            $layers_data[$layer->getId()]['layerName'] = $layer->getLayerName();
            $layers_data[$layer->getId()]['layerShowInSwitcher'] = $layer->getLayerShowInSwitcher();
            $layers_data[$layer->getId()]['shapefileName'] = $layer->getUseruploadshapefile()->getShapefileName();
            $filename = $layer->getUseruploadshapefile()->getShapefileName();
            if ($layer->getTopojsonOnly() === true && $user) {

              $geoms[$layer->getId()]['type'] = "topojsonfile";
              if (file_exists($shapefiles_path . '/shapefiles/' . $user->getId() . '/usershapefile-' . $layer->getUseruploadshapefile()->getId() . '.json')) {
                $the_geom = file_get_contents($shapefiles_path . '/shapefiles/' . $user->getId() . '/usershapefile-' . $layer->getUseruploadshapefile()->getId() . '.json');
                $geoms[$layer->getId()]['geom'] = $the_geom;
              }
              else {
                $message = 'Topojson file ' . $layer->getUseruploadshapefile()->getTopojsonfileName() . ' not exist!';
                $success = false;
                $sql = "select st_asgeojson(st_transform(the_geom,4326)) from useruploadshapefile_geoms_" . $layer->getId();

                $geoms[$layer->getId()]['type'] = "geojson";
                $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
              }
            }
            else {
              $sql = "select st_asgeojson(the_geom) from useruploadshapefile_geoms_" . $layer->getId();

              $geoms[$layer->getId()]['type'] = "geojson";
              $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
            }
          }

          $json = $this->getSldContent($layers[0]->getDefaultSldName());
          return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filename' => $filename, 'message' => $message, 'layers' => $layers_data, 'sld' => $json, 'data' => $geoms)));
        }
      }
      if ($type === 'geojson') {
        if (intval($id) === -1) {
          $geoms = $this->getUserDrawGeometries();
          return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist', 'type' => 'geojson', 'filename' => 'draw', 'data' => $geoms)));
        }
      }
    }
    return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist')));
  }

  /* Params none
   * return user draw geometries as json format
   * 
   */

  private function getUserDrawGeometries() {
    $user = $this->getUser();
    if (!$user) {
      return null;
    }
    $conn = $this->get('database_connection');
    $tsql = "select a.id as ogc_fid,a.id as ogc_id, a.name as keyname , a.geom_type , a.radius , a.buffer ,st_asgeojson(b.the_geom) as feature from userdrawgeometries a, userdrawgeometries_geom b where a.user_id=" . $user->getId() . " and a.id=b.userdrawgeometries_id";
    $stmt = $conn->fetchAll($tsql);
    return $stmt;
  }

  /* Params sld file name $string
   * return sld file content as json format
   * 
   */

  private function getSldContent($sld_filename) {
    // sld path for sld file
    $sld_path = $this->get('kernel')->locateResource('@Map2uCoreBundle') . '/Data';
    if (isset($sld_filename) && $sld_filename != '' && file_exists($sld_path . '/sld/' . $sld_filename)) {
      //    echo $layers[0]->getDefaultSldName();
      // read data from sld file
      $sldfile_content = file_get_contents($sld_path . '/sld/' . $sld_filename);

      // remove prefix ogc:
      $sldstring_temp = str_replace('ogc:', '', $sldfile_content);
      // remove prefix sld:
      $sldstring = str_replace('sld:', '', $sldstring_temp);
      $sldxml = simplexml_load_string($sldstring);
      $json = json_encode($sldxml);
      return $json;
    }
    return '{}';
  }

}
