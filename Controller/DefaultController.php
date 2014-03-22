<?php

namespace Map2u\LeafletBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('Map2uLeafletBundle:Default:index.html.twig', array('name' => $name));
    }
    public function leaflet_map_jsAction()
    {
        return $this->render('Map2uLeafletBundle:Default:leaflet_map_js.html.twig');
    }
     public function mapAction()
    {
        return $this->render('Map2uLeafletBundle:Default:map.html.twig');
    }
}
