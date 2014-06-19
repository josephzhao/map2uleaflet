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
            $layersData = array();

            $message = '';
            $success = true;
            foreach ($layers as $layer) {
                $layersData[$layer->getId()] = array();
                $layersData[$layer->getId()]['id'] = $layer->getId();
                $layersData[$layer->getId()]['layerTitle'] = $layer->getLayerTitle();
                $layersData[$layer->getId()]['layerName'] = $layer->getLayerName();
                $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                $layersData[$layer->getId()]['shapefileName'] = $layer->getUseruploadshapefile()->getShapefileName();
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
                $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->getLayerShowInSwitcher();
                $layersData[$layer->getId()]['shapefileName'] = $layer->getUseruploadshapefile()->getShapefileName();

                if ($layer->getTopojsonOnly() === true && $user) {

                    $geoms[$layer->getId()]['type'] = "topojsonfile";
                    //    /uploads/shapefiles/' . $user->getId() . '/u' . $useruploadshapefile->getId() . '_' . $useruploadshapefile->getTopojsonfileName()
                    if (file_exists($dataPath . '/shapefiles/' . $user->getId() . '/u' . $layer->getUseruploadshapefile()->getId() . '_' . $layer->getUseruploadshapefile()->getTopojsonfileName())) {
                        $theGeom = file_get_contents('/uploads/shapefiles/' . $user->getId() . '/u' . $layer->getUseruploadshapefile()->getId() . '_' . $layer->getUseruploadshapefile()->getTopojsonfileName());
                        $geoms[$layer->getId()]['geom'] = $theGeom;
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

        // shapefiles path for uploaded shapefiles
        $shapefilesPath = $this->get('kernel')->getRootDir() . '/../Data';


//    if (!$user) {
//      return new Response(\json_encode(array('success' => false, 'message' => 'Please Login first!')));
//    }
//    else {
        if ($type === 'topojson' || $type === 'shapefile_topojson') {

            $layers = $em->createQuery('SELECT p FROM Map2uCoreBundle:UploadShapefileLayer p where p.id=' . $id)
                ->getResult();

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
                    $layersData[$layer->getId()]['tip_field'] = $layer->getUseruploadshapefile()->getTipField();
                    $layersData[$layer->getId()]['label_field'] = $layer->getUseruploadshapefile()->getLabelField();

                    $layersData[$layer->getId()]['layerShowInSwitcher'] = $layer->isLayerShowInSwitcher();
                    $layersData[$layer->getId()]['shapefileName'] = $layer->getUseruploadshapefile()->getShapefileName();
                    $filename = $layer->getUseruploadshapefile()->getShapefileName();

                    if ($layer->isTopojsonOnly() === true) {

                        $geoms[$layer->getId()]['type'] = "topojsonfile";
                        if (file_exists($shapefilesPath . '/shapefiles/' . $layer->getUserId() . '/usershapefile-' . $layer->getUseruploadshapefile()->getId() . '.json')) {
                            $theGeom = file_get_contents($shapefilesPath . '/shapefiles/' . $layer->getUserId() . '/usershapefile-' . $layer->getUseruploadshapefile()->getId() . '.json');
                            $geoms[$layer->getId()]['geom'] = $theGeom;
                        }
                        else {
                            $message = 'Topojson file ' . $layer->getUseruploadshapefile()->getTopojsonfileName() . ' not exist!';
                            $success = false;
                            $sql = "select st_asgeojson(st_transform(the_geom,4326)) as geometry from useruploadshapefile_geoms_" . $layer->getId();
                            $type = "geojson";
                            $geoms[$layer->getId()]['type'] = "geojson";
                            $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                        }
                    }
                    else {
                        $sql = "select st_asgeojson(the_geom) as geometry from useruploadshapefile_geoms_" . $layer->getId();
                        $geoms[$layer->getId()]['type'] = "geojson";
                        $type = "geojson";
                        $geoms[$layer->getId()]['geom'] = $conn->fetchAll($sql);
                    }
                }

                $json = $this->getSldContent($layers[0]->getDefaultSldName());
                return new Response(\json_encode(array('success' => $success, 'type' => $type, 'filename' => $filename, 'message' => $message, 'layers' => $layersData, 'sld' => $json, 'data' => $geoms)));
            }
        }
        if ($type === 'geojson') {
            if (intval($id) === -1) {
                $geoms = $this->getUserDrawGeometries();
                return new Response(\json_encode(array('success' => true, 'message' => 'User draw name  not exist', 'type' => 'geojson', 'filename' => 'draw', 'data' => $geoms)));
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
                $rules = $featureTypeStyle->getElementsByTagName('Rule');
                foreach ($rules as $rule) {
                    $titles = $rule->getElementsByTagName('Title');
                    foreach ($titles as $title) {
                        $title_name = $title->nodeValue;
                    }
                   array_push($json,["title"=>$title_name, 'sld'=>$this->processRule($rule)]);
                }
            }
            return json_encode($json);
        }
        return '';
    }

    private function processRule($rule) {
        $ruleJson = array();
        $filters = $rule->getElementsByTagName('Filter');
        $polygons = $rule->getElementsByTagName('PolygonSymbolizer');

        foreach ($filters as $filter) {
            $ruleJson[$filter->nodeName] = $this->processFilter($filter);
        }
        foreach ($polygons as $polygon) {
            $ruleJson[$polygon->nodeName] = $this->processPolygonSymbolizer($polygon);
        }
        return $ruleJson;
    }

    private function processPolygonSymbolizer($polygon) {
        $polygonJson = array();
        $fills = $polygon->getElementsByTagName('Fill');
        foreach ($fills as $fill) {
            $fillArray = array();

            if ($fill->hasChildNodes()) {
                foreach ($fill->childNodes as $child) {
                    if ($child->nodeType === 1)
                        $fillArray[$child->getAttribute('name')] = $child->nodeValue;
                }
            }
            $polygonJson[$fill->nodeName] = $fillArray;
        }
        $strokes = $polygon->getElementsByTagName('Stroke');
        foreach ($strokes as $stroke) {
            $strokeArray = array();
            if ($stroke->hasChildNodes()) {

                foreach ($stroke->childNodes as $child) {
                    if ($child->nodeType === 1)
                        $strokeArray[$child->getAttribute('name')] = $child->nodeValue;
                }
            }
            if ($stroke->nodeType === 1)
                $polygonJson[$stroke->nodeName] = $strokeArray;
        }

        return $polygonJson;
    }

    private function processFilter($filter) {
        $filterJson = array();
        if ($filter->hasChildNodes()) {
            foreach ($filter->childNodes as $child) {
                if ($child->hasChildNodes()) {

                    $filterJson[$child->nodeName] = $this->processFilterChildNodes($child);
                }
                else {

                    if ($child->nodeType === 1)
                        $filterJson[$child->nodeName] = $child->nodeValue;
                }
            }
        }
        else {
            if ($filter->nodeType === 1) {
                $filterJson[$filter->nodeName] = $filter->nodeValue;
            }
        }

        return $filterJson;
    }

    private function processFilterChildNodes($filterChildNodes) {
        $filterChildNodesJson = array();
        if ($filterChildNodes->hasChildNodes()) {
            foreach ($filterChildNodes->childNodes as $child) {
                if ($child->nodeType === 1 && $child->nodeName && $child->nodeValue)
                    $filterChildNodesJson[$child->nodeName] = $child->nodeValue;
            }
        }
        else {
            if ($filterChildNodes->nodeType === 1 && $filterChildNodes->nodeName && $filterChildNodes->nodeValue)
                $filterChildNodesJson[$filterChildNodes->nodeName] = $filterChildNodes->nodeValue;
        }

        return $filterChildNodesJson;
    }

}
