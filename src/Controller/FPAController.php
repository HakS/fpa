<?php

/**
 * @file
 * Contains Drupal\fpa\Controller\FPAController.
 */

namespace Drupal\fpa\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\fpa\FPAFormBuilder;

//use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class FPAController.
 *
 * @package Drupal\fpa\Controller
 */
class FPAController extends ControllerBase {
//  private $container;
//  public function __construct($cont) {
//      $this->container = $cont;
//  }
//
//  public static function create(ContainerInterface $container) {
//      return new static($container);
//  }

  public function permissionsList() {
//    $router = \Drupal::service('router');_fpa_wrapper
//    kint($router->getRouteCollection()->all());


    $render = FPAFormBuilder::getRenderArray();

    return $render;
  }

}
