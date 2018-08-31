<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;


/**
 * @Route("/loader")
 */
class LoaderController extends AbstractController
{
    /**
     * @Route("/", name="loader")
     */
    public function index()
    {
        return $this->render('loader/index.html.twig', [
            'controller_name' => 'LoaderController',
        ]);
    }
}
