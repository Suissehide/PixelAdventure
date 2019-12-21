<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class WorkController extends AbstractController
{
    /**
     * @Route("/work", name="work")
     */
    public function index()
    {
        return $this->render('work/index.html.twig', [
            'controller_name' => 'WorkController',
        ]);
    }
}
