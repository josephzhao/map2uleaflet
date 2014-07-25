<?php

namespace Map2u\LeafletBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Map2u\CoreBundle\Entity\UploadfileLayer;
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
            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where p.userId=' . $this->getUser()->getId() . ' or p.published = true ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where  p.published = true ORDER BY p.seq ASC')
                    ->getResult();
        }

        if ($this->getUser()) {
            $cluster_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where p.userId=' . $this->getUser()->getId() . ' or p.published = true ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $cluster_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where  p.published = true ORDER BY p.seq ASC')
                    ->getResult();
        }

        if ($this->getUser()) {

            $wmslayers = $em->createQuery('SELECT u FROM Map2uCoreBundle:GeoServerLayer u WHERE  (u.public=true and u.published=true)  or u.userId=' . $this->getUser()->getId() . '  order by u.seq')
                    ->getResult();
        } else {

            $wmslayers = $em->createQuery('SELECT u FROM Map2uCoreBundle:GeoServerLayer u WHERE  u.public=true and u.published=true  order by u.seq')
                    ->getResult();
        }

        $layersData = array();
        if ($layers) {

            $message = '';
            $success = true;
            foreach ($layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['layerTitle'] = $layer->getLayerTitle();
                $layerData['layerType'] = 'uploadfilelayer';
                $layerData['layerName'] = $layer->getLayerName();
                $layerData['seq'] = $layer->getSeq();
                $layerData['minZoom'] = $layer->getMinZoom();
                $layerData['maxZoom'] = $layer->getMaxZoom();
                $layerData['clusterLayer'] = false;
                $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                $layerData['defaultShowOnMap'] = $layer->isDefaultShowOnMap();
                $layerData['fileName'] = $layer->getUseruploadfile()->getFileName();
                array_push($layersData, $layerData);
            }
            if ($cluster_layers) {
                foreach ($cluster_layers as $layer) {
                    $layerData = array();
                    $layerData['id'] = $layer->getId();
                    $layerData['layerTitle'] = $layer->getLayerTitle();
                    $layerData['layerName'] = $layer->getLayerName();
                    $layerData['layerType'] = 'leafletcluster';
                    $layerData['seq'] = $layer->getSeq();
                    $layerData['minZoom'] = $layer->getMinZoom();
                    $layerData['maxZoom'] = $layer->getMaxZoom();
                    $layerData['clusterLayer'] = true;
                    $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                    $layerData['defaultShowOnMap'] = $layer->isDefaultShowOnMap();
                    $layerData['fileName'] = $layer->getUseruploadfile()->getFileName();
                    array_push($layersData, $layerData);
                }
            }
            if ($wmslayers) {
                foreach ($wmslayers as $layer) {
                    $layerData = array();
                    $layerData['id'] = $layer->getId();
                    $layerData['layerTitle'] = $layer->getLayerTitle();
                    $layerData['layerName'] = $layer->getLayerName();
                    $layerData['layerType'] = $layer->getLayerType();
                    $layerData['seq'] = $layer->getSeq();
                    $layerData['minZoom'] = $layer->getMinZoom();
                    $layerData['maxZoom'] = $layer->getMaxZoom();
                    $layerData['clusterLayer'] = $layer->getClusterMap();
                    $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                    $layerData['defaultShowOnMap'] = $layer->isDefaultShowOnMap();
                    $layerData['fileName'] = "wms-" . $layer->getLayerName();
                    $layerData['hostName'] = $layer->getHostName();
                    array_push($layersData, $layerData);
                }
            }
            return new Response(\json_encode(array('success' => $success, 'message' => $message, 'layers' => $layersData)));
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
        $dataPath = $this->get('kernel')->getRootDir() . '/../Data';
        echo $user;
        if ($user && $user !== '') {
            $layers = $em//->getRepository('Map2uCoreBundle:UploadfileLayer')//->find(array('userId' => $user->getId()));
                    ->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where p.userId=' . $user->getId() . ' or p.published = true ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $layers = $em//->getRepository('Map2uCoreBundle:UploadfileLayer')//->find(array('userId' => $user->getId()));
                    ->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where  p.published = true ORDER BY p.seq ASC')
                    ->getResult();
        }
        //   var_dump($layers);
        if ($layers) {
            $layersData = array();
            $conn = $this->get('database_connection');
            $geoms = array();
            $message = '';
            $success = true;
            foreach ($layers as $layer) {
                $geoms[$layer->getId()] = array();
                $layersData[$layer->getId()] = array();
                $layersData[$layer->getId()]['id'] = $layer->getId();
                $layersData[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
                $layersData[$layer->getId()]['layerName'] = $layer->getLayerName();
                $layersData[$layer->getId()]['seq'] = $layer->getSeq();
                $layersData[$layer->getId()]['minZoom'] = $layer->getMinZoom();
                $layersData[$layer->getId()]['maxZoom'] = $layer->getMaxZoom();
                $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->getLayerShowInSwitcher();
                $layersData[$layer->getId()]['shapefileName'] = $layer->getUseruploadfile()->getFileName();

                if ($layer->getTopojsonOnly() === true && $user) {

                    $geoms[$layer->getId()]['type'] = "topojsonfile";
                    //    /uploads/shapefiles/' . $user->getId() . '/u' . $useruploadshapefile->getId() . '_' . $useruploadshapefile->getTopojsonfileName()
                    if (file_exists($dataPath . '/shapefiles/' . $user->getId() . '/u' . $layer->getUseruploadshapefile()->getId() . '_' . $layer->getUseruploadshapefile()->getTopojsonfileName())) {
                        $theGeom = file_get_contents('/uploads/shapefiles/' . $user->getId() . '/u' . $layer->getUseruploadshapefile()->getId() . '_' . $layer->getUseruploadshapefile()->getTopojsonfileName());
                        $geoms[$layer->getId()]['geom'] = $theGeom;
                    } else {
                        $message = 'Topojson file ' . $layer->getUseruploadshapefile()->getTopojsonfileName() . ' not exist!';
                        $success = false;
                        $sql = "select st_asgeojson(st_transform(the_geom,4326)) from useruploadfile_geoms_" . $layer->getId();

                        $geoms[$layer->getId()]['type'] = "geojson";
                        $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                    }
                } else {
                    $sql = "select st_asgeojson(the_geom) from useruploadfile_geoms_" . $layer->getId();

                    $geoms[$layer->getId()]['type'] = "geojson";
                    $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                }
            }

            if ($layers[0]->getDefaultSldName() && file_exists($dataPath . '/sld/' . $layers[0]->getDefaultSldName())) {
                //    echo $layers[0]->getDefaultSldName();

                $sldFileContent = file_get_contents($dataPath . '/sld/' . $layers[0]->getDefaultSldName());
                $sldstring = str_replace('ogc:', '', $sldFileContent);
                $sldxml = simplexml_load_string($sldstring);
                var_dump($sldxml);
                $json = json_encode($sldxml);

                var_dump($json);
            }
            return new Response(\json_encode(array('success' => $success, 'message' => $message, 'layers' => $layersData, 'sld' => $json, 'data' => $geoms)));
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
        //   $user = $this->getUser();
        $id = $request->get("id");
        $type = $request->get("type");
        $source = $request->get("source");

        // shapefiles path for uploaded shapefiles
        $shapefilesPath = $this->get('kernel')->getRootDir() . '/../Data';

        //  var_dump($id);
//    if (!$user) {
//      return new Response(\json_encode(array('success' => false, 'message' => 'Please Login first!')));
//    }
//    else {
        if ($type === 'topojson' || $type === 'shapefile_topojson') {

            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where p.id=' . $id)
                    ->getResult();

            //  var_dump($layers);

            if ($layers) {

                $layersData = array();
                $conn = $this->get('database_connection');
                $geoms = array();
                $message = '';
                $success = true;

                foreach ($layers as $layer) {
                    $geoms[$layer->getId()] = array();
                    $layersData[$layer->getId()] = array();
                    $layersData[$layer->getId()]['id'] = $layer->getId();
                    $layersData[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
                    $layersData[$layer->getId()]['layerName'] = $layer->getLayerName();
                    $layersData[$layer->getId()]['tip_field'] = $layer->getUseruploadfile()->getTipField();
                    $layersData[$layer->getId()]['label_field'] = $layer->getUseruploadfile()->getLabelField();

                    $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                    $layersData[$layer->getId()]['fileName'] = $layer->getUseruploadfile()->getFileName();
                    $layersData[$layer->getId()]['fileType'] = $layer->getUseruploadfile()->getType();
                    $filename = $layer->getUseruploadfile()->getFileName();
                    $filetype = $layer->getUseruploadfile()->getType();

                    if ($layer->isTopojsonOnly() === true) {

                        $geoms[$layer->getId()]['type'] = "topojsonfile";
                        if (file_exists($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/usershapefile-' . $layer->getUseruploadfile()->getId() . '.json')) {
                            $theGeom = file_get_contents($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/usershapefile-' . $layer->getUseruploadfile()->getId() . '.json');
                            $geoms[$layer->getId()]['geom'] = $theGeom;
                        } else {
                            $message = 'Topojson file ' . $layer->getUseruploadfile()->getTopojsonfileName() . ' not exist!';
                            $success = false;
                            $sql = "select st_asgeojson(st_transform(the_geom,4326)) as geometry from useruploadfile_geoms_" . $layer->getId();
                            $type = "geojson";
                            $geoms[$layer->getId()]['type'] = "geojson";
                            $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                        }
                    } else {
                        $sql = "select st_asgeojson(the_geom) as geometry from useruploadfile_geoms_" . $layer->getId();
                        $geoms[$layer->getId()]['type'] = "geojson";
                        $type = "geojson";
                        $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                    }
                }

                $json = $this->getSldContent($layers[0]->getDefaultSldName());
                return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filetype' => $filetype, 'filename' => $filename, 'message' => $message, 'layers' => $layersData, 'sld' => $json, 'data' => $geoms)));
            } else {

//                $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserUploadfile p where p.id=' . $id)
//                        ->getResult();
//
//                $json = $this->getSldContent($layers[0]->getSldfileName());
//                 if (file_exists($shapefilesPath . '/uploads/' . $layers[0]->getUserId() . '/topojson/user' . $layers[0]->getType() . '-' . $layers[0]->getId() . '.json')) {
//                    $theGeom = file_get_contents($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/user' . $layer->getType() . '-' . $layer->getId() . '.json');
//                } else {
//                    $theGeom = null;
//                }
//                return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filetype' => $layers[0]->getType(), 'filename' => $layers[0]->getFileName(), 'message' => $message, 'layers' => array(), 'sld' => $json, 'data' => $geoms)));
                //    var_dump($layers);
            }
        }
        if ($type === 'geojson') {
            if (intval($id) === -1) {
                $geoms = $this->getUserDrawGeometries();
                return new Response(\json_encode(array('success' => true, 'message' => 'User draw geometries', 'type' => 'geojson', 'filetype' => 'draw', 'filename' => 'draw', 'data' => $geoms)));
            }
        }
        //  }
        return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist')));
    }

    /**
     * get map layers extend.
     * params:
     * @Route("/clusterlayer", name="leaflet_clusterlayer", options={"expose"=true})
     * @Method("GET|POST")
     * @Template()
     */
    public function clusterlayerAction(Request $request) {

        $em = $this->getDoctrine()->getManager();
        //   $user = $this->getUser();
        $id = $request->get("id");
        $type = $request->get("type");
        $source = $request->get("source");

        // shapefiles path for uploaded shapefiles
        $shapefilesPath = $this->get('kernel')->getRootDir() . '/../Data';

        //  var_dump($id);
//    if (!$user) {
//      return new Response(\json_encode(array('success' => false, 'message' => 'Please Login first!')));
//    }
//    else {
        if ($type === 'topojson' || $type === 'shapefile_topojson') {

            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where p.id=' . $id)
                    ->getResult();

            //  var_dump($layers);

            if ($layers) {

                $layersData = array();
                $conn = $this->get('database_connection');
                $geoms = array();
                $message = '';
                $success = true;

                foreach ($layers as $layer) {
                    $geoms[$layer->getId()] = array();
                    $layersData[$layer->getId()] = array();
                    $layersData[$layer->getId()]['id'] = $layer->getId();
                    $layersData[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
                    $layersData[$layer->getId()]['layerName'] = $layer->getLayerName();
                    $layersData[$layer->getId()]['tip_field'] = $layer->getUseruploadfile()->getTipField();
                    $layersData[$layer->getId()]['label_field'] = $layer->getUseruploadfile()->getLabelField();

                    $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                    $layersData[$layer->getId()]['fileName'] = $layer->getUseruploadfile()->getFileName();
                    $layersData[$layer->getId()]['fileType'] = $layer->getUseruploadfile()->getType();
                    $filename = $layer->getUseruploadfile()->getFileName();
                    $filetype = $layer->getUseruploadfile()->getType();

                    if ($layer->isTopojsonOnly() === true) {

                        $geoms[$layer->getId()]['type'] = "topojsonfile";
                        if (file_exists($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/usershapefile-' . $layer->getUseruploadfile()->getId() . '.json')) {
                            $theGeom = file_get_contents($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/usershapefile-' . $layer->getUseruploadfile()->getId() . '.json');
                            $geoms[$layer->getId()]['geom'] = $theGeom;
                        } else {
                            $message = 'Topojson file ' . $layer->getUseruploadfile()->getTopojsonfileName() . ' not exist!';
                            $success = false;
                            $sql = "select st_asgeojson(st_transform(the_geom,4326)) as geometry from useruploadfile_geoms_" . $layer->getId();
                            $type = "geojson";
                            $geoms[$layer->getId()]['type'] = "geojson";
                            $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                        }
                    } else {
                        $sql = "select st_asgeojson(the_geom) as geometry from useruploadfile_geoms_" . $layer->getId();
                        $geoms[$layer->getId()]['type'] = "geojson";
                        $type = "geojson";
                        $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                    }
                }

                $json = $this->getSldContent($layers[0]->getDefaultSldName());
                return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filetype' => $filetype, 'filename' => $filename, 'message' => $message, 'layers' => $layersData, 'sld' => $json, 'data' => $geoms)));
            } else {

//                $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserUploadfile p where p.id=' . $id)
//                        ->getResult();
//
//                $json = $this->getSldContent($layers[0]->getSldfileName());
//                 if (file_exists($shapefilesPath . '/uploads/' . $layers[0]->getUserId() . '/topojson/user' . $layers[0]->getType() . '-' . $layers[0]->getId() . '.json')) {
//                    $theGeom = file_get_contents($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/user' . $layer->getType() . '-' . $layer->getId() . '.json');
//                } else {
//                    $theGeom = null;
//                }
//                return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filetype' => $layers[0]->getType(), 'filename' => $layers[0]->getFileName(), 'message' => $message, 'layers' => array(), 'sld' => $json, 'data' => $geoms)));
                //    var_dump($layers);
            }
        }
        if ($type === 'geojson') {
            if (intval($id) === -1) {
                $geoms = $this->getUserDrawGeometries();
                return new Response(\json_encode(array('success' => true, 'message' => 'User draw geometries', 'type' => 'geojson', 'filetype' => 'draw', 'filename' => 'draw', 'data' => $geoms)));
            }
        }
        //  }
        return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist')));
    }

    /**
     * get upload file extend.
     * params:
     * @Route("/uploadfile", name="leaflet_uploadfile", options={"expose"=true})
     * @Method("GET")
     * @Template()
     */
    public function uploadfileAction(Request $request) {

        $em = $this->getDoctrine()->getManager();
        //   $user = $this->getUser();
        $id = $request->get("id");
        $type = $request->get("type");


        // shapefiles path for uploaded shapefiles
        $shapefilesPath = $this->get('kernel')->getRootDir() . '/../Data';

        //  var_dump($id);
//    if (!$user) {
//      return new Response(\json_encode(array('success' => false, 'message' => 'Please Login first!')));
//    }
//    else {
        if ($type === 'topojson' || $type === 'shapefile_topojson') {

            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserUploadfile p where p.id=' . $id)
                    ->getResult();

            //  var_dump($layers);

            if ($layers) {

                $layersData = array();
                $conn = $this->get('database_connection');
                $geoms = array();
                $message = '';
                $success = true;

                foreach ($layers as $layer) {
                    $geoms = array();
                    $layersData[$layer->getId()] = array();
                    $layersData[$layer->getId()]['id'] = $layer->getId();
                    $layersData[$layer->getId()]['layerTitle'] = $layer->getFileName();
                    $layersData[$layer->getId()]['layerName'] = $layer->getFileName();
                    $layersData[$layer->getId()]['tip_field'] = $layer->getTipField();
                    $layersData[$layer->getId()]['label_field'] = $layer->getLabelField();

                    $layersData[$layer->getId()]['layerShowInSwitcher'] = true;
                    $layersData[$layer->getId()]['fileName'] = $layer->getFileName();
                    $layersData[$layer->getId()]['fileType'] = $layer->getType();
                    $filename = $layer->getFileName();
                    $filetype = $layer->getType();



                    $geoms[$layer->getId()]['type'] = "topojsonfile";
                    if (file_exists($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/usershapefile-' . $layer->getId() . '.json')) {
                        $theGeom = file_get_contents($shapefilesPath . '/uploads/' . $layer->getUserId() . '/topojson/usershapefile-' . $layer->getId() . '.json');
                        $geoms[$layer->getId()]['geom'] = $theGeom;
                    } else {
                        $message = 'Topojson file ' . $layer->getTopojsonfileName() . ' not exist!';
                        $success = false;
                        $sql = "select st_asgeojson(st_transform(the_geom,4326)) as geometry from useruploadfile_geoms_" . $layer->getId();
                        $type = "geojson";
                        $geoms[$layer->getId()]['type'] = "geojson";
                        $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                    }
                }
                $json = null;
                if ($layers[0]->getSldfileName())
                    $json = $this->getSldContent($layers[0]->getSldfileName());
                return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filetype' => $filetype, 'filename' => $filename, 'message' => $message, 'layers' => $layersData, 'sld' => $json, 'data' => $geoms)));
            }
        }
        if ($type === 'geojson') {
            if (intval($id) === -1) {
                $geoms = $this->getUserDrawGeometries();
                return new Response(\json_encode(array('success' => true, 'message' => 'User draw geometries', 'type' => 'geojson', 'filetype' => 'draw', 'filename' => 'draw', 'data' => $geoms)));
            }
        }
        //  }
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

    private function getSldContent($sldFilename) {
        // sld path for sld file
        $sldPath = $this->get('kernel')->getRootDir() . '/../Data';
        if (isset($sldFilename) && $sldFilename != '' && file_exists($sldPath . '/sld/' . $sldFilename)) {
            //    echo $layers[0]->getDefaultSldName();
            // read data from sld file
            $sldFileContent = file_get_contents($sldPath . '/sld/' . $sldFilename);
            $doc = new \DOMDocument();
            $sdlText = str_replace('sld:', '', $sldFileContent);
            $doc->loadXML(str_replace('ogc:', '', $sdlText));
            $json = array();
            $featureTypeStyles = $doc->getElementsByTagName('FeatureTypeStyle');
            foreach ($featureTypeStyles as $featureTypeStyle) {
                array_push($json, array("$featureTypeStyle->nodeName" => $this->processChild($featureTypeStyle, $json)));
            }
            return json_encode($json[0]);
        }
        return '';
    }

    private function processChild($children, $returnJson) {

        $responseJson = array();
        $res_array = array();
        if ($children->hasChildNodes()) {
            $i = 0;
            foreach ($children->childNodes as $child) {
                if ($child->hasChildNodes() && $child->nodeType === 1) {
                    $childrray = $this->processChild($child, $res_array);
                    if ($child->getAttribute('name') !== null && $child->getAttribute('name') !== '') {
                        $returnJson[$child->getAttribute('name')] = $child->nodeValue;
                    } else {
                        if ($childrray) {

                            if (array_key_exists($child->nodeName, $returnJson)) {
                                array_push($returnJson, array($child->nodeName => $childrray));
                            } else {
                                if ($child->nodeName === 'Rule')
                                    array_push($returnJson, array($child->nodeName => $childrray));
                                else
                                    $returnJson[$child->nodeName] = $childrray;
                            }
                        } else {
                            if ($child->nodeType === 1 && $child->nodeName && trim($child->nodeValue))
                                $returnJson[$child->nodeName] = trim($child->nodeValue);
                        }
                    }
                }
            }
        }
        return $returnJson;
    }

    private function getSldContent_origin($sldFilename) {
        // sld path for sld file
        $sldPath = $this->get('kernel')->getRootDir() . '/../Data';
        if (isset($sldFilename) && $sldFilename != '' && file_exists($sldPath . '/sld/' . $sldFilename)) {
            //    echo $layers[0]->getDefaultSldName();
            // read data from sld file
            $sldFileContent = file_get_contents($sldPath . '/sld/' . $sldFilename);
            $doc = new \DOMDocument();
            $sdlText = str_replace('sld:', '', $sldFileContent);
            $doc->loadXML(str_replace('ogc:', '', $sdlText));
            $json = array();
            $featureTypeStyles = $doc->getElementsByTagName('FeatureTypeStyle');
            foreach ($featureTypeStyles as $featureTypeStyle) {
                $rules = $featureTypeStyle->getElementsByTagName('Rule');
                foreach ($rules as $rule) {
                    $titles = $rule->getElementsByTagName('Title');
                    $title_name = '';
                    foreach ($titles as $title) {
                        $title_name = $title->nodeValue;
                    }
                    array_push($json, array("title" => $title_name, 'sld' => $this->processRule($rule)));
                }
            }
            return json_encode($json);
        }
        return '';
    }

}
