<?php

/**
 * @file
 * Contains Drupal\fpa\FPAFormBuilder.
 */

namespace Drupal\fpa;

use Drupal\Component\Utility\Bytes;

/**
 * Class FPAFormBuilder.
 *
 * @package Drupal\fpa
 */
class FPAFormBuilder {

  /**
   * @return int Approximate number of bytes of ram required to render the permissions form.
   */
  public static function getRequiredMemory($suffix = '') {
    $permission = \Drupal::service('user.permissions');
    $permissions_count = count($permission->getPermissions());
    $user_roles_count = count(user_roles());
    $page_ram_required = (9 * 1024 * 1024);
    // Takes ~26kb per row without any checkboxes.
    $permission_row_overhead = 27261.028783658;
    $permissions_ram_required = $permissions_count * $permission_row_overhead;
    // Determined by checking peak ram on permissions page, over several different number of visible roles.
    $bytes_per_checkbox = 18924.508820799;
    $checkboxes_ram_required = $permissions_count * $user_roles_count * $bytes_per_checkbox;
    $output = (int) ($page_ram_required + $permissions_ram_required + $checkboxes_ram_required);
    if (!empty($suffix)) return $output . $suffix;
    return $output;
  }

  public static function checkMemoryLimit() {
    $permissions_memory_required = static::getRequiredMemory('b');
    $memory_limit = ini_get('memory_limit');
    return ((!$memory_limit) || ($memory_limit == -1) || (Bytes::toInt($memory_limit) >= Bytes::toInt($permissions_memory_required)));
  }

  public static function getRenderArray() {
    $form = \Drupal::service('form_builder')->getForm('\Drupal\user\Form\UserPermissionsForm');
//    kint($form);
    return static::buildWrapper(NULL, array(), array(), NULL);
  }

  protected static function buildWrapper($permissions_table, $modules, $user_roles, $actions_output) {
    $render = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'fpa-container',
        ),
      ),
    );

    $hiders = array(
      'fpa-hide-descriptions' => array(
        'hide' => t('Hide descriptions'),
        'show' => t('Show descriptions'),
      ),
      'fpa-hide-system-names' => array(
        'hide' => t('Hide system names'),
        'show' => t('Show system names'),
      ),
    );

    $render['#attributes']['class'][] = 'fpa-hide-system-names';

    $hide_container = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'fpa-toggle-container',
        ),
      ),
    );

    foreach ($hiders as $hide_class => $labels) {
      $hide_container[$hide_class] = array(
        '#theme' => 'link',
        '#text' => '',
        '#path' => '',
        '#options' => array(
          'attributes' => array_merge($labels, array(
            'fpa-toggle-class' => $hide_class,
          )),
          'html' => TRUE,
          'fragment' => ' ',
          'external' => TRUE, // Prevent base path from being added to link.
        ),
      );
    }

    $render['hide_container'] = $hide_container;

    $wrapper = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'fpa-wrapper',
        ),
      ),
    );

    $render['wrapper'] = &$wrapper;


    /**
     * <style /> block template.
     */
    $style_template = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'style-wrapper-class-name', // Override on specific block.
        ),
      ),
    );

    $style_template['style'] = array(
      '#type' => 'html_tag',
      '#tag' => 'style',
      '#attributes' => array(
        'type' => array(
          'text/css',
        ),
      ),
      '#value' => '', // #value needed for closing tag.
    );

    /**
     * <style /> block for role filtering.
     */
    $wrapper['role_styles'] = $style_template;
    $wrapper['role_styles']['#attributes']['class'][0] = 'fpa-role-styles';

    /**
     * <style /> block for permission filtering.
     */
    $wrapper['perm_styles'] = $style_template;
    $wrapper['perm_styles']['#attributes']['class'][0] = 'fpa-perm-styles';

    /**
     * Left section contains module list and form submission button.
     */
    $left_section = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'fpa-left-section',
        ),
      ),
    );

    $wrapper['left_section'] = &$left_section;


    /**
     * Right section contains filter form and permissions table.
     */
    $right_section = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'fpa-right-section',
        ),
      ),
    );

    $wrapper['right_section'] = &$right_section;

    $module_template = array(
      FPA_ATTR_MODULE => array(),
      FPA_ATTR_PERMISSION => array(),
      'data' => array(
        '#type' => 'container',
        '#attributes' => array(),

        'link' => array(
          '#type' => 'markup',
          '#markup' => '', // l($module['text'], 'admin/people/permissions', $options)
        ),

        'counters' => array(),

        'total' => array(
          '#type' => 'html_tag',
          '#tag' => 'span',
          '#attributes' => array(
            'class' => array('fpa-perm-total'),
            'fpa-total' => 0,
          ),
          '#value' => '', // #value needed for closing tag.
        ),
      ),
    );

    $counter_template = array(
      '#type' => 'html_tag',
      '#tag' => 'span',
      '#attributes' => array(
        'class' => array('fpa-perm-counter'),
        FPA_ATTR_PERMISSION => array(), // Counters only count permissions match.
      ),
      '#value' => '', // #value required for closing tag.
    );

    $items = array();

    $all_modules = array(
      'text' => t('All modules'),
      FPA_ATTR_MODULE => array(),
      FPA_ATTR_PERMISSION => array(),
    );

    return $render;
  }
}