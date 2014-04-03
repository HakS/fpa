<?php

/**
 * @file
 * Contains form alter hooks to inject FPA functionality.
 */


/**
 * Implements hook_form_FORM_ID_alter().
 */
function fpa_form_node_type_form_alter(&$form, &$form_state) {
  if (!empty($form['type']['#default_value']) && user_access('administer permissions')) {
    fpa_fieldset($form['#node_type']->type . ' content', $form, array('#group' => 'additional_settings'));
  }
}

/**
 * Implements hook_form_FORM_ID_alter().
 */
function fpa_form_user_admin_permissions_alter(&$form, &$form_state) {
  
  $form['#theme'] = array('fpa_user_admin_permissions');
  
  $fpa_module_path = drupal_get_path('module', 'fpa');
  
  $form['#attached']['library'][] = array('system', 'jquery.cookie');

  $form['#attached']['css'][] = $fpa_module_path . '/css/fpa.css';
  $form['#attached']['js'][] = $fpa_module_path . '/js/fpa.js';
  $form['#attached']['js'][] = array(
    'type' => 'setting',
    'data' => array(
      'fpa' => array(
        'attr' => array(
          'permission' => FPA_ATTR_PERMISSION,
          'module' =>     FPA_ATTR_MODULE,
          'role' =>       FPA_ATTR_ROLE,
        ),
      ),
    ),
  );
}
