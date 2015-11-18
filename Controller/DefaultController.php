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
use Map2u\CoreBundle\Entity\SystemSettings;

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

    public function mapAction(Request $request) {


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
        $private_userdraw_layers = null;
        if ($this->getUser()) {
            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where p.userId=' . $this->getUser()->getId() . ' or (p.published = true or p.public = true ) ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where  p.published = true or p.public = true ORDER BY p.seq ASC')
                    ->getResult();
        }

        if ($this->getUser()) {
            $cluster_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where p.userId=' . $this->getUser()->getId() . ' or ( p.published = true or p.public = true ) ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $cluster_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where  p.published = true or p.public = true ORDER BY p.seq ASC')
                    ->getResult();
        }

        if ($this->getUser()) {
            $heatmap_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletHeatmapLayer p where p.userId=' . $this->getUser()->getId() . ' or ( p.published = true or p.public = true ) ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $heatmap_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletHeatmapLayer p where  p.published = true or p.public = true ORDER BY p.seq ASC')
                    ->getResult();
        }
        if ($this->getUser()) {
            $thematicmap_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:ThematicMap p where p.userId=' . $this->getUser()->getId() . ' or ( p.published = true or p.public = true) ORDER BY p.seq ASC')
                    ->getResult();
        } else {
            $thematicmap_layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:ThematicMap p where  p.published = true or p.public = true ORDER BY p.seq ASC')
                    ->getResult();
        }
        if ($this->getUser()) {
            $private_userdraw_layers = $em->createQuery("SELECT p FROM Map2uCoreBundle:UserDrawLayer p  ORDER BY p.name ASC")
                    ->getResult();
        }
        $public_userdraw_layers = $em->createQuery("SELECT p FROM Map2uCoreBundle:UserDrawLayer p where  p.published = true  ORDER BY p.name ASC")
                ->getResult();

        if ($this->getUser()) {

            $wmslayers = $em->createQuery('SELECT u FROM Map2uCoreBundle:GeoServerLayer u WHERE  (u.public=true or u.published=true)  or u.userId=' . $this->getUser()->getId() . '  order by u.seq')
                    ->getResult();
        } else {

            $wmslayers = $em->createQuery('SELECT u FROM Map2uCoreBundle:GeoServerLayer u WHERE  u.public=true or u.published=true  order by u.seq')
                    ->getResult();
        }

        $layersData = array();
        $message = '';
        $success = false;
        if ($layers) {
            $success = true;
            foreach ($layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['datasource'] = $layer->getUseruploadfile()->getId();
                $layerData['layerTitle'] = $layer->getLayerTitle();
                $layerData['layerType'] = 'uploadfilelayer';
                $layerData['layerName'] = $layer->getLayerName();
                $layerData['seq'] = $layer->getSeq();
                $layerData['minZoom'] = $layer->getMinZoom();
                $layerData['maxZoom'] = $layer->getMaxZoom();
                $layerData['clusterLayer'] = false;
                $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                $layerData['defaultShowOnMap'] = $layer->isDefaultShowOnMap();
                $layerData['filename'] = $layer->getUseruploadfile()->getFileName();
                if ($layer->getDefaultSldName()) {
                    $layerData['sld'] = $this->getSldContent($layer->getDefaultSldName());
                } else {
                    if ($layer->getUseruploadfile()->getSldfileName()) {
                        $layerData['sld'] = $this->getSldContent($layer->getUseruploadfile()->getSldfileName());
                    }
                }

                array_push($layersData, $layerData);
            }
        }
        if ($cluster_layers) {
            foreach ($cluster_layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['datasource'] = $layer->getUseruploadfile()->getId();
                $layerData['layerTitle'] = $layer->getLayerTitle();
                $layerData['layerName'] = $layer->getLayerName();
                $layerData['layerType'] = 'clustermap';
                $layerData['seq'] = $layer->getSeq();
                $layerData['minZoom'] = $layer->getMinZoom();
                $layerData['maxZoom'] = $layer->getMaxZoom();
                $layerData['clusterLayer'] = true;
                $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                $layerData['defaultShowOnMap'] = $layer->isDefaultShowOnMap();
                $layerData['filename'] = $layer->getUseruploadfile()->getFileName();
                array_push($layersData, $layerData);
            }
        }
        if ($heatmap_layers) {
            foreach ($heatmap_layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['datasource'] = $layer->getDatasourceId();
                $layerData['layerTitle'] = $layer->getLayerTitle();
                $layerData['layerName'] = $layer->getLayerName();
                $layerData['layerType'] = 'heatmap';
                $layerData['seq'] = $layer->getSeq();
                $layerData['minZoom'] = $layer->getMinZoom();
                $layerData['maxZoom'] = $layer->getMaxZoom();
                $layerData['clusterLayer'] = false;
                $layerData['layerShowInSwitcher'] = true;
                $layerData['sld']['gradient'] = $layer->getGradient();

                $layerData['defaultShowOnMap'] = $layer->getDefaultShowOnMap();
                //   $layerData['filename'] = $layer->getUseruploadfile()->getFileName();
                array_push($layersData, $layerData);
            }
        }
        if ($thematicmap_layers) {
            foreach ($thematicmap_layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['datasource'] = $layer->getDatasourceId();
                $layerData['layerTitle'] = $layer->getLayerTitle();
                $layerData['layerName'] = $layer->getLayerName();
                $layerData['layerType'] = 'thematicmap';
                $layerData['seq'] = $layer->getSeq();
                $layerData['minZoom'] = $layer->getMinZoom();
                $layerData['maxZoom'] = $layer->getMaxZoom();
                $layerData['clusterLayer'] = false;
                $layerData['layerShowInSwitcher'] = true;
                $layerData['sld']['categories'] = unserialize($layer->getCategories());
                $layerData['sld']['category'] = unserialize($layer->getCategory());
                $layerData['defaultShowOnMap'] = $layer->getDefaultShowOnMap();
                //   $layerData['filename'] = $layer->getUseruploadfile()->getFileName();
                array_push($layersData, $layerData);
            }
        }
        if ($wmslayers) {
            foreach ($wmslayers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['datasource'] = $layer->getId();
                $layerData['layerTitle'] = $layer->getLayerTitle();
                $layerData['layerName'] = $layer->getLayerName();
                $layerData['layerType'] = $layer->getLayerType();
                $layerData['seq'] = $layer->getSeq();
                $layerData['minZoom'] = $layer->getMinZoom();
                $layerData['maxZoom'] = $layer->getMaxZoom();
                $layerData['clusterLayer'] = $layer->isClusterMap();
                $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                $layerData['defaultShowOnMap'] = $layer->isDefaultShowOnMap();
                $layerData['filename'] = "wms-" . $layer->getLayerName();
                $layerData['hostName'] = $layer->getHostName();
                $layerData['srs'] = $layer->getSrs();
                array_push($layersData, $layerData);
            }
        }
        if ($public_userdraw_layers) {
            $communityLayerData = array();
            $communityLayerData['id'] = 1;
            $communityLayerData['datasource'] = 1;
            $communityLayerData['layerTitle'] = 'Community layers';
            $communityLayerData['layerName'] = 'Community layers';
            $communityLayerData['layerType'] = 'group';
            $communityLayerData['seq'] = 200;
            $communityLayerData['layerShowInSwitcher'] = true;
            $communityLayerData['filename'] = "userdrawlayer-group";
            $communityLayerData['layers'] = array();
            foreach ($public_userdraw_layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['layerId'] = $layer->getId();
                $layerData['datasource'] = $layer->getId();
                $layerData['layerTitle'] = $layer->getName();
                $layerData['layerName'] = $layer->getName();
                $layerData['seq'] = $layer->getSeq();
                $layerData['public'] = true;
                $layerData['groupName'] = "Community layers";
                $layerData['layerType'] = "userdrawlayer";
                $layerData['clusterLayer'] = false;
                $layerData['layerShowInSwitcher'] = true;
                $layerData['defaultShowOnMap'] = $layer->getDefaultShowOnMap();
                $layerData['filename'] = "userdrawlayer-" . $layer->getName();
                array_push($communityLayerData['layers'], $layerData);
            }
            array_push($layersData, $communityLayerData);
        }
        if ($private_userdraw_layers) {
            $personalLayerData = array();
            $personalLayerData['id'] = 2;
            $personalLayerData['datasource'] = 2;
            $personalLayerData['layerTitle'] = 'My personal layers';
            $personalLayerData['layerName'] = 'My personal layers';
            $personalLayerData['layerType'] = 'group';
            $personalLayerData['seq'] = 201;
            $personalLayerData['layerShowInSwitcher'] = true;
            $personalLayerData['filename'] = "userdrawlayer-group";
            $personalLayerData['layers'] = array();
            foreach ($private_userdraw_layers as $layer) {
                $layerData = array();
                $layerData['id'] = $layer->getId();
                $layerData['datasource'] = $layer->getId();
                $layerData['layerTitle'] = $layer->getName();
                $layerData['layerName'] = $layer->getName();
                $layerData['layerType'] = "userdrawlayer";
                $layerData['public'] = false;
                $layerData['seq'] = $layer->getSeq();
                $layerData['groupName'] = "My personal layers";
                $layerData['clusterLayer'] = false;
                $layerData['layerShowInSwitcher'] = true;
                $layerData['defaultShowOnMap'] = $layer->getDefaultShowOnMap();
                $layerData['filename'] = "userdrawlayer-" . $layer->getName();
                array_push($personalLayerData['layers'], $layerData);
            }
            array_push($layersData, $personalLayerData);
        }
        return new Response(\json_encode(array('success' => $success, 'message' => $message, 'layers' => $layersData)));

        // return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist')));
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
     * get map layer info.
     * params:
     * @Route("/maplayerinfo", name="leaflet_maplayerinfo", options={"expose"=true})
     * @Method("GET")
     * @Template()
     */
    public function mapLayerinfoAction(Request $request) {
        $id = $request->get("id");
        $layertype = $request->get("layerType");
        switch ($layertype) {
            case 'clustermap':
                $data = $this->getClustermapInfo($id);
                break;
            case 'heatmap':
                $data = $this->getHeatmapInfo($id);
                break;
            case 'userdrawlayer':
                $data = $this->getUserdrawlayerInfo($id);
                break;
            case 'thematicmap':
                $data = $this->getThematicmapInfo($id);
                break;
            case 'useruploadfile':
                $data = $this->getUserUploadfileInfo($id);
                break;
            case 'uploadfilelayer':
                $data = $this->getUploadfileLayerInfo($id);
            case 'wfs':
                $data = $this->getWFSLayerInfo($id);
            default:
                return new Response(\json_encode(array('success' => false, 'message' => 'no valid layer type info!', 'data' => null)));
        }
        return new Response(\json_encode(array('success' => true, 'layer' => $data)));
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
        $layertype = $request->get("layerType");
        $public = $request->get("public");

        $source = $request->get("source");
        $data = null;
        // datafiles path for uploaded shapefiles and created topojson files
        $datafilesPath = $this->get('kernel')->getRootDir() . '/../Data';

        switch ($layertype) {
            case 'clustermap':
                $data = $this->getClusterLayerData($id, $datafilesPath);
                break;
            case 'heatmap':
                $data = $this->getHeatmapLayerData($id, $datafilesPath);
                break;
            case 'thematicmap':
                $data = $this->getThematicMapLayerData($id, $datafilesPath);
                break;
            case 'uploadfile':
            case 'useruploadfile':
                $data = $this->getUploadfileLayerData($id, $datafilesPath);
                break;
            case 'uploadfilelayer':
                $data = $this->getUploadfilelayerLayerData($id, $datafilesPath);
                break;
            case 'wfs':
                $data = $this->getWFSLayerData($id, $datafilesPath, $source);
                break;
            case 'userdraw':
                $data = $this->getUserdrawLayerData($datafilesPath, $id, $public);
                break;
            case 'userdrawlayer':
                $data = $this->getUserdrawLayerDataFromID($datafilesPath, $id, $public);

                break;
        }
        return $data;
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
                    $layersData[$layer->getId()]['tip_percentage'] = $layer->getUseruploadfile()->getTipPercentage();
                    $layersData[$layer->getId()]['tip_times100'] = $layer->getUseruploadfile()->getTipTimes100();
                    $layersData[$layer->getId()]['tip_number'] = $layer->getUseruploadfile()->getTipNumber();
                    $layersData[$layer->getId()]['label_field'] = $layer->getUseruploadfile()->getLabelField();
                    $layersData[$layer->getId()]['layerType'] = 'leafletcluster';
                    $layersData[$layer->getId()]['seq'] = $layer->getSeq();
                    $layersData[$layer->getId()]['minZoom'] = $layer->getMinZoom();
                    $layersData[$layer->getId()]['maxZoom'] = $layer->getMaxZoom();
                    $layersData[$layer->getId()]['clusterLayer'] = true;

                    $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                    $layersData[$layer->getId()]['fileName'] = $layer->getUseruploadfile()->getFileName();
                    $layersData[$layer->getId()]['fileType'] = $layer->getUseruploadfile()->getType();
                    $filename = $layer->getUseruploadfile()->getFileName();
                    $filetype = $layer->getUseruploadfile()->getType();

                    if ($layer->isTopojsonOnly() === true) {

                        $geoms[$layer->getId()]['type'] = "topojson";
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
                    $layersData[$layer->getId()]['tip_percentage'] = $layer->getTipPercentage();
                    $layersData[$layer->getId()]['tip_times100'] = $layer->getTipTimes100();
                    $layersData[$layer->getId()]['tip_number'] = $layer->getTipNumber();
                    $layersData[$layer->getId()]['label_field'] = $layer->getLabelField();

                    $layersData[$layer->getId()]['layerShowInSwitcher'] = true;
                    $layersData[$layer->getId()]['fileName'] = $layer->getFileName();
                    $layersData[$layer->getId()]['fileType'] = $layer->getType();
                    $filename = $layer->getFileName();
                    $filetype = $layer->getType();



                    $geoms[$layer->getId()]['type'] = "topojson";
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

    protected function getClustermapInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        if ($layers) {
            $layerData['id'] = $layers[0]->getId();
            $layerData['layerTitle'] = $layers[0]->getLayerTitle();
            $layerData['layerName'] = $layers[0]->getLayerName();
            $layerData['datasource'] = $layers[0]->getId();
            $layerData['seq'] = $layers[0]->getSeq();
            $layerData['layerType'] = 'clustermap';
            $layerData['layerShowInSwitcher'] = true;
            $layerData['fileName'] = $layers[0]->getFileName();
            $layerData['fileType'] = $layers[0]->getType();
        }
        return $layerData;
    }

    protected function getUserdrawlayerInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserDrawLayer p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        if ($layers) {
            $layerData['id'] = $layers[0]->getId();
            $layerData['layerTitle'] = $layers[0]->getName();
            $layerData['layerName'] = $layers[0]->getName();
            $layerData['datasource'] = $layers[0]->getId();
            $layerData['seq'] = $layers[0]->getSeq();
            $layerData['layerType'] = 'userdrawlayer';
            $layerData['layerShowInSwitcher'] = $layers[0]->getDefaultShowOnMap();
            $layerData['fileName'] = $layers[0]->getName();
            $layerData['fileType'] = "userdrawlayer";
        }
        return $layerData;
    }

    protected function getHeatmapInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletHeatmapLayer p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        $layerOpt = array();
        if ($layers) {
            $layerData['id'] = $layers[0]->getId();
            $layerData['layerTitle'] = $layers[0]->getFileName();
            $layerData['layerName'] = $layers[0]->getFileName();
            $layerData['datasource'] = $layers[0]->getDatasourceId();
            $layerData['seq'] = $layers[0]->getSeq();
            $layerData['layerType'] = 'heatmap';
            $layerData['layerShowInSwitcher'] = true;
            $layerData['fileName'] = $layers[0]->getFileName();
            $layerData['fileType'] = $layers[0]->getType();

            $layerOpt['fieldname'] = $layers[0]->getFieldname();
            $layerOpt['gradient'] = $layers[0]->getGradient();
            $layerOpt['category'] = $layers[0]->getCategory();
        }
        $layerData['opt'] = $layerOpt;
        return $layerData;
    }

    protected function getThematicmapInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:ThematicMap p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        $layerOpt = array();

        if ($layers) {
            $layerData['id'] = $layers[0]->getId();
            $layerData['layerTitle'] = $layers[0]->getLayerTitle();
            $layerData['layerName'] = $layers[0]->getLayerName();
            $layerData['datasource'] = $layers[0]->getDatasourceId();
            $layerData['seq'] = $layers[0]->getSeq();
            $layerData['layerType'] = 'thematicmap';
            $layerData['layerShowInSwitcher'] = true;

            if (isset($layers[0]->useruploadfile)) {
                $layerOpt['fileName'] = $layers[0]->getUseruploadfile()->getFileName();
                $layerOpt['fileType'] = $layers[0]->getUseruploadfile()->getType();
            } else {
                $layerOpt['fileName'] = null;
                $layerOpt['fileType'] = null;
            }
            $layerOpt['thematicmap'] = true;

            $layerOpt['fieldname'] = $layers[0]->getFieldname();
            $layerOpt['gradient'] = $layers[0]->getGradient();
            $layerOpt['category'] = unserialize($layers[0]->getCategory());
            $layerOpt['min'] = $layerOpt['category']['min'];
            $layerOpt['max'] = $layerOpt['category']['max'];
            $layerOpt['categories'] = unserialize($layers[0]->getCategories());
        }

        $layerData['opt'] = $layerOpt;
        return $layerData;
    }

    protected function getUserUploadfileInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserUploadfile p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        if ($layers) {
            $layerData['id'] = $layers[0]->getId();
            $layerData['layerTitle'] = $layers[0]->getFileName();
            $layerData['layerName'] = $layers[0]->getFileName();
            $layerData['datasource'] = $layers[0]->getId();
            $layerData['layerType'] = 'useruploadfile';
            $layerData['layerShowInSwitcher'] = true;
            $layerData['fileName'] = $layers[0]->getFileName();
            $layerData['fileType'] = $layers[0]->getType();
        }
        return $layerData;
    }

    protected function getUploadfileLayerInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        if ($layers) {
            $layerData['id'] = $layers[0]->getId();
            $layerData['layerTitle'] = $layers[0]->getLayerTitle();
            $layerData['layerName'] = $layers[0]->getLayerName();
            $layerData['datasource'] = $layers[0]->getUseruploadfile()->getId();
            $layerData['seq'] = $layers[0]->getSeq();
            $layerData['layerType'] = 'uploadfilelayer';
            $layerData['layerShowInSwitcher'] = true;
            $layerData['fileName'] = $layers[0]->getFileName();
            $layerData['fileType'] = $layers[0]->getType();
        }
        return $layerData;
    }

    protected function getWFSLayerInfo($id) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:GeoServerLayer p where p.id=' . $id)
                ->getResult();
        $layerData = array();
        $layerData['layerTitle'] = $layers[0]->getFileName();
        $layerData['layerName'] = $layers[0]->getFileName();
        $layerData['datasource'] = $layers[0]->getId();
        $layerData['seq'] = $layers[0]->getSeq();
        $layerData['layerType'] = 'wfs';
        $layerData['layerShowInSwitcher'] = true;
        $layerData['fileName'] = $layers[0]->getFileName();
        $layerData['fileType'] = $layers[0]->getType();
        return $layerData;
    }

    protected function getUploadfileLayerData($id, $datafilesPath) {
        $em = $this->getDoctrine()->getManager();
        $upload_files = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserUploadfile p where p.id=' . $id)
                ->getResult();
        if (!$upload_files) {
            return new Response(\json_encode(array('success' => true, 'message' => "upload file id:$id not exist")));
        }
        $message = '';
        $success = true;
        $upload_file = $upload_files[0];

        $geom['datatype'] = 'topojson';

        $layerData = array();
        $layerData['id'] = -1;
        $layerData['layerTitle'] = $upload_file->getFileName();
        $layerData['layerName'] = $upload_file->getFileName();
        $layerData['tip_field'] = $upload_file->getTipField();
        $layerData['tip_percentage'] = $upload_file->getTipPercentage();
        $layerData['tip_times100'] = $upload_file->getTipTimes100();
        $layerData['tip_number'] = $upload_file->getTipNumber();
        $layerData['label_field'] = '';
        $layerData['source'] = $upload_file->getId();
        $layerData['layerType'] = 'useruploadfile';
        $layerData['clusterLayer'] = false;
        $layerData['layerShowInSwitcher'] = true;
        $layerData['fileName'] = $upload_file->getFileName();
        $layerData['fileType'] = $upload_file->getType();

        $layerData['seq'] = 1;
        $layerData['minZoom'] = null;
        $layerData['maxZoom'] = null;

        $geom = $this->getGeomJsonData($upload_file->getUserId(), true, $upload_file->getId(), $datafilesPath);
        $sld_json = $this->getSldContent($upload_file->getSldfileName());
        return new Response(\json_encode(array('success' => $success, 'datatype' => $geom['datatype'], 'message' => $message, 'layer' => $layerData, 'sld' => $sld_json, 'geomdata' => $geom)));
    }

    protected function getUploadfilelayerLayerData($id, $datafilesPath) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadfileLayer p where p.id=' . $id)
                ->getResult();
        if (!$layers) {
            return new Response(\json_encode(array('success' => true, 'message' => "cluster layer id:$id not exist")));
        }
        $message = '';
        $success = true;
        $layer = $layers[0];
        $layerData = $this->setLayerInfo($layer);
        $layerData['layerType'] = 'uploadfilelayer';
        $layerData['clusterLayer'] = false;

        $geom = $this->getGeomJsonData($layer->getUserId(), $layer->isTopojsonOnly(), $layer->getUseruploadfile()->getId(), $datafilesPath);
        $sld_json = $this->getSldContent($layer->getDefaultSldName());
        return new Response(\json_encode(array('success' => $success, 'datatype' => $geom['datatype'], 'message' => $message, 'layer' => $layerData, 'sld' => $sld_json, 'geomdata' => $geom)));
    }

    protected function getHeatmapLayerData($id, $datafilesPath) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where p.id=' . $id)
                ->getResult();
        if (!$layers) {
            return new Response(\json_encode(array('success' => true, 'message' => "cluster layer id:$id not exist")));
        }
        $message = '';
        $success = true;
        $layer = $layers[0];
        $layerData = $this->setLayerInfo($layer);
        $layerData['layerType'] = 'heatmap';
        $layerData['clusterLayer'] = true;
        $geom = $this->getGeomJsonData($layer->getUserId(), $layer->isTopojsonOnly(), $layer->getUseruploadfile()->getId(), $datafilesPath);
        $sld_json = $this->getSldContent($layer->getDefaultSldName());
        return new Response(\json_encode(array('success' => $success, 'datatype' => $geom['datatype'], 'message' => $message, 'layer' => $layerData, 'sld' => $sld_json, 'geomdata' => $geom)));
    }

    protected function getThematicMapLayerData($id, $datafilesPath) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:ThematicMap p where p.id=' . $id)
                ->getResult();
        if (!$layers) {
            return new Response(\json_encode(array('success' => true, 'message' => "cluster layer id:$id not exist")));
        }
        $message = '';
        $success = true;
        $layer = $layers[0];
        $layerData = array();
        $layerData['id'] = $layer->getId();
        $layerData['layerTitle'] = $layer->getLayerTitle();
        $layerData['layerName'] = $layer->getLayerName();

        $layerData['datasource'] = $layer->getDatasourceId();
        $layerData['minZoom'] = $layer->getMinZoom();
        $layerData['maxZoom'] = $layer->getMaxZoom();
        $layerData['layerShowInSwitcher'] = true;
        if (isset($layer->useruploadfile)) {
            $layerData['fileName'] = $layer->getUseruploadfile()->getFileName();
            $layerData['fileType'] = $layer->getUseruploadfile()->getType();
        } else {
            $layerData['fileName'] = null;
            $layerData['fileType'] = null;
        }
        $layerData['layerType'] = 'thematicmap';
        $geom = $this->getGeomJsonData($layer->getUserId(), true, $layer->getDatasourceId(), $datafilesPath);
        $sld_json = null; //$this->getSldContent($layer->getDefaultSldName());
        return new Response(\json_encode(array('success' => $success, 'datatype' => $geom['datatype'], 'message' => $message, 'layer' => $layerData, 'sld' => $sld_json, 'geomdata' => $geom)));
    }

    protected function getClusterLayerData($id, $datafilesPath) {
        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:LeafletClusterLayer p where p.id=' . $id)
                ->getResult();
        if (!$layers) {
            return new Response(\json_encode(array('success' => true, 'message' => "cluster layer id:$id not exist")));
        }
        $message = '';
        $success = true;
        $layer = $layers[0];
        $layerData = $this->setLayerInfo($layer);
        $layerData['layerType'] = 'leafletcluster';
        $layerData['clusterLayer'] = true;
        $geom = $this->getGeomJsonData($layer->getUserId(), $layer->isTopojsonOnly(), $layer->getUseruploadfile()->getId(), $datafilesPath);
        $sld_json = $this->getSldContent($layer->getDefaultSldName());
        return new Response(\json_encode(array('success' => $success, 'datatype' => $geom['datatype'], 'message' => $message, 'layer' => $layerData, 'sld' => $sld_json, 'geomdata' => $geom)));
    }

    protected function getUserdrawLayerData($datafilesPath, $id, $public) {

        $geom['geom'] = $this->getUserDrawGeometries($id, $public);
        $geom['datatype'] = 'geojson';
        $layerData = array();
        $layerData['id'] = -1;
        $layerData['layerTitle'] = "My draw geometries";
        $layerData['layerName'] = "My draw geometries";
        $layerData['tip_field'] = '';
        $layerData['tip_percentage'] = false;
        $layerData['tip_times100'] = false;
        $layerData['tip_number'] = 3;
        $layerData['label_field'] = '';
        $layerData['layerType'] = 'userdraw';
        $layerData['clusterLayer'] = false;
        $layerData['layerShowInSwitcher'] = true;
        $layerData['fileName'] = 'userdraw';
        $layerData['fileType'] = 'userdraw';
        return new Response(\json_encode(array('success' => true, 'datatype' => $geom['datatype'], 'message' => 'User draw geometries', 'layer' => $layerData, 'sld' => null, 'geomdata' => $geom)));
    }

    protected function getUserdrawLayerDataFromID($datafilesPath, $id, $public) {

        $em = $this->getDoctrine()->getManager();
        $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UserDrawLayer p where p.id=' . $id)->getResult();
        if (!$layers) {
            return new Response(\json_encode(array('success' => true, 'message' => "User draw layer id:$id not exist")));
        }
        $geom['geom'] = $this->getUserDrawLayerGeometries($id, $public);

        $geom['datatype'] = 'geojson';
        $layerData = array();
        $layerData['id'] = $layers[0]->getId();
        $layerData['layerTitle'] = $layers[0]->getName();
        $layerData['layerName'] = $layers[0]->getName();
        $layerData['tip_field'] = '';
        $layerData['tip_percentage'] = false;
        $layerData['tip_times100'] = false;
        $layerData['tip_number'] = 3;
        $layerData['label_field'] = '';
        $layerData['datasource'] = $layers[0]->getId();
        $layerData['layerType'] = 'userdrawlayer';
        $layerData['clusterLayer'] = false;
        $layerData['layerShowInSwitcher'] = $layers[0]->getDefaultShowOnMap();
        $layerData['fileName'] = $layers[0]->getName();
        $layerData['fileType'] = 'userdrawlayer';
        return new Response(\json_encode(array('success' => true, 'datatype' => $geom['datatype'], 'message' => 'User draw geometries', 'layer' => $layerData, 'sld' => null, 'geomdata' => $geom)));
    }

    protected function getGeomJsonData($userid, $topojson_type, $uploadfile_id, $datafilesPath) {
        $conn = $this->get('database_connection');
        $geom = array();

        $geom['datatype'] = "geojson";

        $sql1 = "SELECT EXISTS (SELECT 1  FROM   pg_catalog.pg_class c JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace  WHERE  n.nspname = 'public' AND c.relname = 'useruploadfile_geoms_" . $uploadfile_id . "')";
        $stmt1 = $conn->fetchAll($sql1);
        // if geometry table not exist return empty array
        if ($stmt1[0]['exists'] === false) {
            return $geom;
        }

        $sql = "SELECT column_name FROM information_schema.columns WHERE table_name='useruploadfile_geoms_" . $uploadfile_id . "'";
        $stmt = $conn->fetchAll($sql);

        $rowCount = count($stmt);
        $column_name_array = array();

        for ($i = $rowCount - 1; $i >= 0; $i--) {
            if ($stmt[$i]['column_name'] === 'the_geom' || $stmt[$i]['column_name'] === 'geom' || $stmt[$i]['column_name'] === 'the_geom4326') {
                unset($stmt[$i]);
            } else {
                array_push($column_name_array, $stmt[$i]['column_name']);
            }
            //   return new Response(\json_encode(array('success' => false, 'data' => 'label Field:' . strtolower($data['boundary_name_field2']) . ' not exist')));
        }



        $column_names = implode(',', $column_name_array);

        if ($column_names == null || trim($column_names) == '') {
            $column_names = "*";
        }

        $sql = "SELECT row_to_json(fc) as geom FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.the_geom)::json As geometry
    , row_to_json(lp) As properties
   FROM useruploadfile_geoms_" . $uploadfile_id . " As lg 
         INNER JOIN (SELECT " . $column_names . " FROM useruploadfile_geoms_" . $uploadfile_id . ") As lp 
       ON lg.ogc_fid = lp.ogc_fid  ) As f )  As fc";
        if ($topojson_type === true) {
            if (file_exists($datafilesPath . '/uploads/' . $userid . '/topojson/usershapefile-' . $uploadfile_id . '.json')) {
                $theGeom = file_get_contents($datafilesPath . '/uploads/' . $userid . '/topojson/usershapefile-' . $uploadfile_id . '.json');
                $geom['geom'] = $theGeom;
                $geom['datatype'] = "topojson";
                return $geom;
            } else {
                // $sql = "select st_asgeojson(st_transform(the_geom,4326)) as geometry from useruploadfile_geoms_" . $uploadfile->getId();
                $result = $conn->fetchAll($sql);
                $geom['geom'] = $result[0]['geom'];
            }
        } else {
            // $sql = "select st_asgeojson(the_geom) as geometry from useruploadfile_geoms_" . $uploadfile->getId();
            $result = $conn->fetchAll($sql);
            $geom['geom'] = $result[0]['geom'];
        }
        return $geom;
    }

    protected function setLayerInfo($layer) {
        $layerData = array();
        $layerData['id'] = $layer->getId();
        $layerData['layerTitle'] = $layer->getLayerTitle();
        $layerData['layerName'] = $layer->getLayerName();
        $layerData['tip_field'] = $layer->getUseruploadfile()->getTipField();
        $layerData['tip_percentage'] = $layer->getUseruploadfile()->getTipPercentage();
        $layerData['tip_times100'] = $layer->getUseruploadfile()->getTipTimes100();
        $layerData['tip_number'] = $layer->getUseruploadfile()->getTipNumber();
        $layerData['label_field'] = $layer->getUseruploadfile()->getLabelField();

        $layerData['seq'] = $layer->getSeq();
        $layerData['minZoom'] = $layer->getMinZoom();
        $layerData['maxZoom'] = $layer->getMaxZoom();

        $layerData['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
        $layerData['fileName'] = $layer->getUseruploadfile()->getFileName();
        $layerData['fileType'] = $layer->getUseruploadfile()->getType();

        return $layerData;
    }

    protected function getWFSLayerData($id, $datafilesPath, $source) {
        
    }

    /* Params none
     * return user draw geometries as json format
     *
     */

    protected function getUserDrawGeometries($id, $public) {
        $user = $this->getUser();
        if (!$user) {
            return null;
        }
        $conn = $this->get('database_connection');
        if ($public) {
            $tsql = "select b.id as ogc_fid,b.id as ogc_id, b.name as keyname , b.geom_type , b.radius , b.buffer ,st_asgeojson(c.the_geom) as feature from userdrawlayers a,userdrawgeometries b, userdrawgeometries_geom c where a.id=" . $id . " and a.id=b.userdrawlayer_id and b.b_public=true  and b.id=c.userdrawgeometries_id";
        } else {
            $tsql = "select b.id as ogc_fid,b.id as ogc_id, b.name as keyname , b.geom_type , b.radius , b.buffer ,st_asgeojson(c.the_geom) as feature from userdrawlayers a,userdrawgeometries b, userdrawgeometries_geom c where  a.id=" . $id . " and a.id=b.userdrawlayer_id and b.user_id=" . $user->getId() . " and b.id=c.userdrawgeometries_id";
        }
        $stmt = $conn->fetchAll($tsql);
        return $stmt;
    }

    protected function getUserDrawLayerGeometries($id, $public) {
        $user = $this->getUser();
        $conn = $this->get('database_connection');
        $bpublic = filter_var($public, FILTER_VALIDATE_BOOLEAN);
        if ($bpublic) {
            $tsql = "select b.id as ogc_fid,b.id as ogc_id, b.name as keyname , b.geom_type , b.radius , b.buffer ,st_asgeojson(c.the_geom) as feature from userdrawlayers a,userdrawgeometries b, userdrawgeometries_geom c where a.id=" . $id . " and a.id=b.userdrawlayer_id and b.b_public=true  and b.id=c.userdrawgeometries_id";
        } else {
            $tsql = "select b.id as ogc_fid,b.id as ogc_id, b.name as keyname , b.geom_type , b.radius , b.buffer ,st_asgeojson(c.the_geom) as feature from userdrawlayers a,userdrawgeometries b, userdrawgeometries_geom c where a.id=" . $id . " and b.user_id=" . $user->getId() . " and b.b_public=false and a.id=b.userdrawlayer_id and b.id=c.userdrawgeometries_id";
            //         $tsql = "select a.id as ogc_fid,a.id as ogc_id, a.name as keyname , a.geom_type , a.radius , a.buffer ,st_asgeojson(b.the_geom) as feature from userdrawgeometries a, userdrawgeometries_geom b where (a.b_public=true or a.user_id=" . $user->getId() . ") and a.userdrawlayer_id=" . $id . " and a.id=b.userdrawgeometries_id";
        }
        $stmt = $conn->fetchAll($tsql);
        return $stmt;
    }

    /* Params sld file name $string
     * return sld file content as json format
     *
     */

    protected function getSldContent($sldFilename) {
        // sld path for sld file
        $sldPath = $this->get('kernel')->getRootDir() . '/../Data';
        if (isset($sldFilename) && $sldFilename != '' && file_exists($sldPath . '/sld/' . $sldFilename)) {
            //    echo $layers[0]->getDefaultSldName();
            // read data from sld file
            $sldFileContent = file_get_contents($sldPath . '/sld/' . $sldFilename);
            $doc = new \DOMDocument();
            $sdlText1 = str_replace('sld:', '', $sldFileContent);
            $sdlText = str_replace('se:', '', $sdlText1);
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

    protected function processChild($children, $returnJson) {

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

    protected function getSldContent_origin($sldFilename) {
        // sld path for sld file
        $sldPath = $this->get('kernel')->getRootDir() . '/../Data';
        if (isset($sldFilename) && $sldFilename != '' && file_exists($sldPath . '/sld/' . $sldFilename)) {
            //    echo $layers[0]->getDefaultSldName();
            // read data from sld file
            $sldFileContent = file_get_contents($sldPath . '/sld/' . $sldFilename);
            $doc = new \DOMDocument();
            $sdlText_temp = str_replace('sld:', '', $sldFileContent);
            $sdlText = str_replace('se:', '', $sdlText_temp);
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

    /**
     * get upload file extend.
     * params:
     * @Route("/mapoverlayers", name="leaflet_save_mapoverlayers", options={"expose"=true})
     * @Method("POST")
     */
    public function mapoverlayersAction(Request $request) {

        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();
        if (!$user) {
            return new Response(\json_encode(array('success' => false, 'message' => 'Please Login first!')));
        }
        $mapstatus = $em->createQuery("SELECT p FROM Map2uCoreBundle:SystemSettings p where p.userId=" . $user->getId() . " and p.name='mapstatus'")
                ->getResult();
        if (!$mapstatus) {
            $mapstatus = new SystemSettings();
            $mapstatus->setName('mapstatus');
        }

        $data = $request->get("data");
        $mapstatus->setSettings(serialize($data));
        $em->persist($mapstatus);
        $em->flush();
        return new Response(\json_encode(array('success' => true, 'message' => 'Settings successfully saved!')));
    }

}
