<?php

namespace Map2u\LeafletBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('Map2uLeafletBundle:Default:index.html.twig', array('name' => $name));
    }
}
